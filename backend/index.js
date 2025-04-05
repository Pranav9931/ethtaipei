// Required Dependencies
const express = require("express");
const multer = require("multer");
const { createHash } = require("crypto");
const mongoose = require("mongoose");
const Web3 = require("web3").default;
const fs = require("fs");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

// ============ CONFIGURATION ============
const app = express();
const port = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const HASHKEY_RPC = process.env.HASHKEY_RPC;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const ABI = require("./contracts/abis/RwaNFT.json");

// ============ MONGODB SETUP ============
mongoose.connect(MONGO_URI);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => console.log("MongoDB connected"));

const assetSchema = new mongoose.Schema({
  fileHash: String,
  fileName: String,
  metadataURI: String,
  owner: String,
  tokenId: Number,
  timestamp: { type: Date, default: Date.now },
});
const Asset = mongoose.model("rwaAssets", assetSchema);

// ============ MIDDLEWARE ============
app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ============ WEB3 SETUP ============
const web3 = new Web3(HASHKEY_RPC);
const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);
const nftContract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

// ============ ROUTES ============
app.post("/tokenize", upload.single("asset"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);
    const hash = createHash("sha256").update(fileBuffer).digest("hex");
    const metadataURI = `ipfs://${hash}`; // IPFS optional here, adjust as needed
    const userAddress = req.body.owner;

    // Interact with smart contract to mint NFT
    const tx = await nftContract.methods
      .mintWithLock(userAddress, metadataURI, account.address)
      .send({ from: account.address, gas: 500000 });

    const tokenId = parseInt(tx.events.NFTMinted.returnValues.tokenId);

    // Save to MongoDB
    const asset = new Asset({
      fileHash: hash,
      fileName: req.file.originalname,
      metadataURI,
      owner: userAddress,
      tokenId,
    });
    await asset.save();

    res.json({ success: true, tokenId, metadataURI });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ============ SERVER START ============
app.listen(port, () => console.log(`Server running on port ${port}`));
