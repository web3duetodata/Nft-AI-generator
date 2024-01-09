import { useState, useEffect } from 'react';
import { NFTStorage, File } from 'nft.storage'
import { Buffer } from 'buffer';
import { ethers } from 'ethers';
import axios from 'axios';

// Components
import Spinner from 'react-bootstrap/Spinner';
import Navigation from './components/Navigation';

// ABIs
import NFT from './abis/NFT.json'

// Config
import config from './config.json';

function App() {
  const [data, setData] = useState('');
  const [provider, setProvider] = useState(null)
  const [account, setAccount] = useState(null)
  const [nft, setNFT] = useState(null)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState(null)
  const [url, setURL] = useState(null)

  const [message, setMessage] = useState("")
  const [isWaiting, setIsWaiting] = useState(false)

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)

    const network = await provider.getNetwork()

    const nft = new ethers.Contract(config[network.chainId].nft.address, NFT, provider)
    setNFT(nft)
  }

  const submitHandler = async (e) => {
    e.preventDefault()

    if (name === "" || description === "") {
      window.alert("Please provide a name and description")
      return
    }

    setIsWaiting(true)

    // Call AI API to generate a image based on description
    const imgData= await createImage();
    console.log("imageData m submit =", imgData);
    // Upload image to IPFS (NFT.Storage)
    const url = await uploadImage(imgData, name, description)

    // Mint NFT
    //await mintImage(url)

    setIsWaiting(false)
    setMessage("")
  }

  const createImage = async () => {
    setMessage("Generating Image...")
    const prompt= description;
    const apiKey = 'VFXhX3yjdyBZlwsMmfiLYsKmvz7XxBsjVqFgsENRNj6DP49uf8ASzkKPLQuh';
    console.log("promt before api call=", prompt);
    console.log('Generating Images....');
    try {
      
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
      const img= result.data.output[0];
      setImage(img)
      return img;
    }catch (error) {
      console.error(error);
      
    }
    
  }

  const uploadImage = async (imageData, name, description) => {
    setMessage("Uploading Image...")

    // Create instance to NFT.Storage
    const nftstorage = new NFTStorage({ token: process.env.REACT_APP_NFT_STORAGE_API_KEY })

    // Send request to store image
    const { ipnft } = await nftstorage.store({
      image: new File([imageData], "image.png", { type: "image/png" }),
      name: name,
      description: description,
    })

    // Save the URL
    console.log("ipft nft storage=",ipnft);
    const url = `https://ipfs.io/ipfs/${ipnft}/metadata.json`
    setURL(url)

    return url
  }

  // const mintImage = async (tokenURI) => {
  //   setMessage("Waiting for Mint...")

  //   const signer = await provider.getSigner()
  //   const transaction = await nft.connect(signer).mint(tokenURI, { value: ethers.utils.parseUnits("1", "ether") })
  //   await transaction.wait()
  // }

  // const fileFromPath = async (filePath) => {
  //   const content = await fs.promises.readFile(filePath)
  //   const type = mime.getType(filePath)
  //   return new File([content], path.basename(filePath), { type })

  // }


  useEffect(() => {
    loadBlockchainData()
  }, [])

  return (<div>
    <Navigation account={account} setAccount={setAccount} />

    <div className='form'>
      <form onSubmit={submitHandler}>
        <input type="text" placeholder="Create a name..." onChange={(e) => { setName(e.target.value) }} />
        <input type="text" placeholder="Create a description..." onChange={(e) => setDescription(e.target.value)} />
        <input type="submit" value="Create & Mint" />
      </form>

      <div className="image">
        {!isWaiting && image ? (
          <img src={image} alt="AI generated image" />
        ) : isWaiting ? (
          <div className="image__placeholder">
            <Spinner animation="border" />
            <p>{message}</p>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>

    {!isWaiting && url && (
      <p>
        View&nbsp;<a href={url} target="_blank" rel="noreferrer">Metadata</a>
      </p>
    )}
  </div>
  );
}

export default App;
