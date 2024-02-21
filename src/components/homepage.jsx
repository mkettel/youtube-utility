'use client'

/**
 * This code was generated by v0 by Vercel.
 * @see https://v0.dev/t/3AsujLGrggG
 */
import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent, DropdownMenu } from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"
import Image from "next/image"

const initialState = {
  message: null,
}

export function Homepage() {

  const [state, setState] = useState(initialState);
  const [file, setFile] = useState(null);
  const [text, setText] = useState(''); // State to hold text input
  const [imageUrl, setImageUrl] = useState('');
  const [originalImageUrl, setOriginalImageUrl] = useState(''); // State to store the original image URL so each render it uses this one
  const [selectedSegment, setSelectedSegment] = useState(''); // State to track selected segment
  const [selectedBrand, setSelectedBrand] = useState('') // State to track selected brand
  const [isLoading, setIsLoading] = useState(false); // State to track loading state
  const [secondText, setSecondText] = useState('');

  // Handle segment selection
  const handleSegmentSelect = (segment) => {
    setSelectedSegment(segment); // Update the selected segment state 

    if (segment === 'Access Exclusive') {
      setText('EXCLUSIVE');
    } else {
      // Uncomment this line if you want to clear the overlay text for non-Exclusive options
      setText('');
    }
  };

  // Check if text input should be enabled
  const isTextInputEnabled = ['Access Interview (short)', 'Access Interview (long)', 'Access Exclusive'].includes(selectedSegment);

  // Clear the text input when the segment changes
  useEffect(() => {
    if (!isTextInputEnabled) {
      setText(''); // Clear the text input
      setSecondText(''); // Clear the second text input
    } else if (selectedSegment !== 'Access Interview (long)') {
      setSecondText(''); // Clear the second text input
    }
  }, [selectedSegment, isTextInputEnabled]); 

  // Handle brand selection
  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand); // 
  }

  const handleTextChange = (e) => {
    setText(e.target.value); // Update text state on change
  };

  // For when the image is selected
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImageUrl(reader.result);
        setOriginalImageUrl(reader.result); // Store the original image URL
      };
      reader.readAsDataURL(file);
    }
  };

  const pngE = '/pngs/E.png';

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true); // Start loading
  
    // Prepare the data as a JSON object
    const data = { 
      text: text,
      secondText: secondText,
      file: originalImageUrl,
      segment: selectedSegment,
      pngE: pngE
    }; // Assuming 'text' is the state variable holding your text input

    console.log('file: ', file);
  
    fetch('/upload/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      if (data.base64Image) {
        setImageUrl(data.base64Image); // Correctly access and update state
      }
      setIsLoading(false); // Stop loading after the image is generated
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }

  // Function to download the image
  const downloadImage = (dataUrl, fileName = 'thumbnail.jpeg') => {
    // Convert base64 to blob
    const fetchImage = async (url) => {
      const response = await fetch(url);
      const blob = await response.blob();
      const href = window.URL.createObjectURL(blob);
      // Trigger download
      const link = document.createElement('a');
      link.href = href;
      link.setAttribute('download', fileName); // Set the file name for the download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(href); // Clean up
    };
  
    fetchImage(dataUrl);
  };

  // look for changes in the imageUrl state
  useEffect(() => {
    if (imageUrl) {
      // Create the thumbnail
      console.log('imageUrl changed');
    }
  }, [imageUrl]);


  return (
    (<Card className="my-8 sm:pt-10">
      <form>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <CardHeader className="pb-0">
              <CardTitle>Thumbnail Generator</CardTitle>
              <CardDescription>Only the best thumbnails.</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="grid gap-2">
                <label className="text-sm font-medium mt-4">Brand</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="!rounded-lg !text-left w-full" id="style" variant="outline">
                      {selectedBrand || 'Select Brand'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => handleBrandSelect('Access Hollywood')}>Access Hollywood</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium mt-4">Segment</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="!rounded-lg !text-left w-full" id="theme" variant="outline">
                      {selectedSegment || 'Select Segment'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => handleSegmentSelect('Access Standard')}>Access Standard</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleSegmentSelect('Access Royals')}>Access Royals</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleSegmentSelect('Access Interview (short)')}>Access Interview (short)</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleSegmentSelect('Access Interview (long)')}>Access Interview (long)</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleSegmentSelect('Access Exclusive')}>Access Exclusive</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleSegmentSelect('Access Daily')}>Access Daily</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleSegmentSelect('Access Award Season')}>Access Award Season</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleSegmentSelect('Access Reality Nightcap')}>Access Reality Nightcap</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleSegmentSelect('Access Housewives Nightcap')}>Access Housewives Nightcap</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="grid mt-4 gap-2">
                  <label className="text-sm font-medium" htmlFor="upload">
                    Upload Image
                  </label>
                  <input
                    type="file"
                    id="upload"
                    style={{ display: 'none' }}
                    accept="image/*" // Accept images only
                    onChange={handleFileChange} // Call the function to handle the file change
                  />
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex items-center justify-center w-full md:h-[200px]"
                    onClick={() => document.getElementById('upload').click()} // Trigger file input click
                  >
                    <span className="text-gray-500 font-medium cursor-pointer">
                      Select an Image
                    </span>
                  </div>
                </div>
              {['Access Interview (long)', 'Access Exclusive', 'Access Interview (short)'].includes(selectedSegment) && (
                <div className="grid gap-2">
                  <label className="text-sm font-medium mt-4" htmlFor="text">
                    Add Text
                  </label>
                  <Input
                    className="w-full"
                    id="text"
                    placeholder="Enter text to include in the thumbnail" 
                    onChange={handleTextChange}
                    disabled={!isTextInputEnabled}
                    value={text}
                    />
                </div>
              )}  

              {selectedSegment === 'Access Interview (long)' && (
                <div className="grid gap-2 text-sm font-medium mt-4">
                  <label className="text-sm font-medium " htmlFor="secondText">
                    Add Second Name
                  </label>
                  <Input
                    className="w-full"
                    id="secondText"
                    placeholder="Enter the second name"
                    onChange={(e) => setSecondText(e.target.value)}
                    disabled={!isTextInputEnabled}
                    value={secondText}
                  />
                </div>
              )}
              
              <Button onClick={handleSubmit} className="w-full my-4" disabled={isLoading}>
                {isLoading ? 'Generating...' : 'Generate Thumbnail'}
              </Button>
            </CardContent>
          </div>
          <div
            className="border border-gray-200 rounded-lg p-4 flex items-center justify-center">
            {imageUrl ? (
              <div className="flex flex-col">
              <Image
                alt="Uploaded Thumbnail"
                className="object-cover w-full h-48"
                src={imageUrl}
                style={{
                  aspectRatio: "400/200",
                  objectFit: "contain",
                }}
                width={400}
                height={200}
              />
              <Button 
                onClick={() => downloadImage(imageUrl)} 
                className="mt-4"
                variant="secondary"
              >
                Download Image
              </Button>
              </div>
            ) : (
              <Image
                alt="Placeholder"
                className="object-cover w-full h-48"
                src={'/placeholder.svg'}
                style={{
                  aspectRatio: "400/200",
                  objectFit: "cover",
                }}
                width={400}
                height={200}
              />
            )}
          </div>
          <p aria-live="polite" className="sr-only">
            {state?.message}
          </p>
        </div>
      </form>
    </Card>)
  );
}


function UploadIcon(props) {
  return (
    (<svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 1-2 2H5a2 1-2-2v-4" />
      <polyline points="17 8 12 3 7" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>)
  );
}
