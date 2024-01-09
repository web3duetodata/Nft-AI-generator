import express from "express";
import cors from "cors";
import axios from "axios";
// Import the NFTStorage class and File constructor from the 'nft.storage' package
import { NFTStorage, File } from 'nft.storage';
// The 'mime' npm package helps us set the correct file type on our File objects
import mime from 'mime';
// The 'fs' builtin module on Node.js provides access to the file system
import fs from 'fs';
// The 'path' module provides helpers for manipulating filesystem paths
import path from 'path';


const app = express();

app.use(cors());
app.use(express.json());

app.get('/message', (req, res) => {
    res.json({ message: "Hello from server!" });
});

const apiKey = 'VFXhX3yjdyBZlwsMmfiLYsKmvz7XxBsjVqFgsENRNj6DP49uf8ASzkKPLQuh';
const NFT_STORAGE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDAwZmUwYTdlZEUyYzMzM2QwYzlEMThDNDRhOTkwOTBDYjAxODNFMjQiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY5NDQ0NzAyMDA2OCwibmFtZSI6IkFpR2VuZXJhdG9ySVBGU0tleSAifQ.Be0lQfcAU2r5wS8T68qRlto_ZZ4pFNs4cz8JT4DrjNQ';
  
app.post("/generateImage", async (req, res) => {
  console.log('Generating Images....');
    try {
      const prompt = req.body.prompt;
      const numberOfPics = 1;
      console.log("prompt from front=",prompt);
      const bodyInfo = JSON.stringify({
        key: apiKey,
        prompt: prompt,
        negative_prompt: null,
        width: "512",
        height: "512",
        samples: numberOfPics,
        num_inference_steps: "30",
        safety_checker: "no",
        enhance_prompt: "yes",
        seed: null,
        guidance_scale: 7.5,
        webhook: null,
        track_id: null,
      });
  
      
      const result = await axios.post("https://stablediffusionapi.com/api/v3/text2img", bodyInfo, {
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      
      //await download(result.data.output[i], number + ".png");
      console.log('Generated Pic m front');
      console.log('Api result= ',  result.data.output[0]);
      
  
      res.json({ message: "Images generated successfully",
                 data: result.data.output[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error generating images" });
    }
});

app.post("/uploadImage", async (req, res) => {
  try {
    console.log("Upload Image...")
    const imagePath = req.body.imageData;
    const name= req.body.name;
    const description= req.body.description;
    console.log("image path before api call uploadImage=", imagePath);
    console.log("image name before api call uploadImage=", name);
    console.log("image description before api call uploadImage=", description);
    // load the file from disk
    const image = await fileFromPath(imagePath)

    // create a new NFTStorage client using our API key
    const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY })

    const result= nftstorage.store({image, name, description,})
    console.log("result before upload image in ipfs= ",result);
    res.json({ message: "Images Uploaded successfully",
                 data: result});
 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generating images" });
  }
});

async function fileFromPath(filePath) {
  const content = await fs.promises.readFile(filePath)
  const type = mime.getType(filePath)
  return new File([content], path.basename(filePath), { type })
}
  
app.listen(8000, () => {
    console.log(`Server is running on port 8000.`);
  });

  