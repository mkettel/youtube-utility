'use client'

import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent, DropdownMenu } from "@/components/ui/dropdown-menu"
import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import brands from '@/config/brands';
import config from '@/config';

const initialState = {
  message: null,
}

export function Homepage() {
  const [state] = useState(initialState);
  const [_, setFile] = useState(null);
  const [text, setText] = useState(''); // State to hold text input
  const [imageUrl, setImageUrl] = useState('');
  const [originalImageUrl, setOriginalImageUrl] = useState(''); // State to store the original image URL so each render it uses this one
  const [selectedSegment, setSelectedSegment] = useState(''); // State to track selected segment
  const [selectedBrand, setSelectedBrand] = useState(null) // State to track selected brand
  const [isLoading, setIsLoading] = useState(false); // State to track loading state
  const [secondText, setSecondText] = useState(''); // State to hold the second text input
  const [fontSize, setFontSize] = useState(config.defaultFontSize); // Default font size

  // Handle segment selection
  const handleSegmentSelect = (segment) => {
    // Set selected segment
    setSelectedSegment(segment); // Update the selected segment state 

    // Set font size
    if (typeof segment.fontSize === 'number') {
      setFontSize(segment.fontSize);
    } else {
      setFontSize(config.defaultFontSize);
    }

    // Set text
    if (segment.text) {
      setText(segment.text);
    } else {
      setText('');
    }
  };

  // Check if text input should be enabled
  const isTextInputEnabled = useMemo(() => {
    if (!selectedSegment) {
      return false;
    }

    return selectedSegment.hasCustomText === true;
  }, [selectedSegment]);

  // Clear the text input when the segment changes
  useEffect(() => {
    if (!isTextInputEnabled && !selectedSegment.text) {
      setText(''); // Clear the text input
      setSecondText(''); // Clear the second text input
    } else if (!selectedSegment.hasSecondText) {
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
        setImageUrl(reader.result);
        setOriginalImageUrl(reader.result); // Store the original image URL
      };
      reader.readAsDataURL(file);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();

    setIsLoading(true); // Start loading
  
    // Prepare the data as a JSON object
    const data = {
      brandId: selectedBrand.id,
      segmentId: selectedSegment.id,
      text: text,
      secondText: secondText,
      file: originalImageUrl,
      fontSize: fontSize,
    }; 

    try {
      const response = await fetch('/upload/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      const responseData = await response.json();
      console.log('Success:', responseData);
  
      if (!responseData) {
        throw new Error('No response data');
      } else if (responseData.error) {
        throw new Error(responseData.error);
      } else if (!responseData.base64Image) {
        throw new Error('Image not generated');
      }

      setImageUrl(responseData.base64Image); // Correctly access and update state
    } catch (error) {
      console.error('Error:', error);

      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  // Function to download the image
  const downloadImage = async (dataUrl) => {
    downloadFile({ dataUrl, fileName: 'thumbnail.jpeg' });
  };

  // look for changes in the imageUrl state
  useEffect(() => {
    if (imageUrl) {
      // Create the thumbnail
      console.log('imageUrl changed');
    }
  }, [imageUrl]);

  // File Drag n Drop --------------------------------------------------------------
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
  
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  // Function to process the file
  const processFile = (file) => {
    setFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setImageUrl(base64String);
      setOriginalImageUrl(base64String); // Store the original image URL
    };
    reader.readAsDataURL(file);
  };

  // Prevent default behavior for drag over and drag enter events
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  // --------------------------------------------------------------------------

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: 20,},
    transition: { type: 'spring', damping: 30, stiffness: 200, mass: 5 }
  }

  return (
    (<Card layout className="my-8 sm:pt-10">
      <form>
        <AnimatePresence>
        <motion.div layout className="grid gap-4 md:grid-cols-2">
          <motion.div layout className="space-y-4">
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
                      {selectedBrand ? selectedBrand.name : 'Select Brand'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {brands.map(brand => (
                      <DropdownMenuItem key={brand.id} onSelect={() => handleBrandSelect(brand)}>
                        {brand.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium mt-4">Segment</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="!rounded-lg !text-left w-full" id="theme" variant="outline">
                      {selectedSegment ? selectedSegment.name : 'Select Segment'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                  {selectedBrand ? (
                    selectedBrand.segments.map(segment => (
                      <DropdownMenuItem key={segment.id} onSelect={() => handleSegmentSelect(segment)}>
                        {segment.name}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled>No brand selected</DropdownMenuItem>
                  )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <motion.div layout className="grid mt-4 gap-2">
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
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                  >
                    <span className="text-gray-500 font-medium cursor-pointer">
                      Select an Image or Drag it Here
                    </span>
                  </div>
              </motion.div>

              {/* Text Input Fields */}
              {selectedSegment.hasCustomText === true && (
                <motion.div 
                  layout
                  className="grid gap-2"
                  initial='hidden'
                  animate='visible'
                  exit='hidden'
                  transition={{ type: 'spring', damping: 30, stiffness: 200, mass: 5 }}
                  variants={textVariants}
                >
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
                </motion.div>
              )}  
              
              {selectedSegment.hasCustomSecondText === true && (
                <motion.div 
                  layout
                  className="grid gap-2 text-sm font-medium mt-4"
                  initial='hidden'
                  animate='visible'
                  transition={{ type: 'spring', damping: 30, stiffness: 200, mass: 5 }}
                  variants={textVariants}
                >
                  <label className="text-sm font-medium " htmlFor="secondText">
                    Add Second Text
                  </label>
                  <Input
                    className="w-full"
                    id="secondText"
                    placeholder="Enter the second name"
                    onChange={(e) => setSecondText(e.target.value)}
                    disabled={!isTextInputEnabled}
                    value={secondText}
                  />
                </motion.div>
              )}

              {/* Font Size */}
              {isTextInputEnabled && (
              <motion.div 
                layout
                className="grid gap-2"
                initial='hidden'
                animate='visible'
                transition={{ type: 'spring', damping: 50, stiffness: 200, mass: 5, delay: 0.05 }}
                variants={textVariants}
              >
                  <label htmlFor="fontSizeSlider" className="text-sm font-medium mt-4">Font Size - {fontSize}</label>
                  <input
                    type="range"
                    id="fontSizeSlider"
                    name="fontSizeSlider"
                    min="90" // Minimum font size
                    max="185" // Maximum font size
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-xs px-2">
                    <span>90</span>
                    <span>185</span>
                  </div>
              </motion.div>
              )}

              <motion.div layout>
                <Button onClick={handleSubmit} className="w-full my-4" disabled={isLoading}>
                  {isLoading ? 'Generating...' : 'Generate Thumbnail'}
                </Button>
              </motion.div>
            </CardContent>
          </motion.div>
          <motion.div
            className="border border-gray-200 rounded-lg p-4 flex items-center justify-center"
            layout
            >
            {imageUrl ? (
              <div className="flex relative flex-col">
              <Image
                alt="Uploaded Thumbnail"
                className="object-cover w-full h-52"
                src={imageUrl}
                style={{
                  aspectRatio: "400/200",
                  objectFit: "contain",
                }}
                width={400}
                height={200}
              />
              {/* <CustomFontSVG text={text} fontSize={fontSize} /> */}
              <Button
                type="button"
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
          </motion.div>
          <p aria-live="polite" className="sr-only">
            {state?.message}
          </p>
        </motion.div>
        </AnimatePresence>
      </form>
    </Card>)
  );
}

// const CustomFontSVG = ({ text, fontSize }) => {
//   return (
//     <svg width="500" height="70" className="" xmlns="http://www.w3.org/2000/svg">
//       <style>
//         {`
//           @font-face {
//             font-family: 'Mark OT Cond Bold Italic';
//             src: url('/fonts/MarkOT-CondBoldItalic.otf') format('truetype');
//           }
//           text {
//             font-family: 'Mark OT Cond Bold Italic';
//           }
//         `}
//       </style>
//       <text x="10" y="50" fill="white" style={{ fontFamily: 'Mark OT Cond Bold Italic', textTransform: 'uppercase', fontSize: fontSize / 4 }}>{text}</text>
//     </svg>
//   );
// };

// function UploadIcon(props) {
//   return (
//     (<svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round">
//       <path d="M21 15v4a2 2 0 1-2 2H5a2 1-2-2v-4" />
//       <polyline points="17 8 12 3 7" />
//       <line x1="12" x2="12" y1="3" y2="15" />
//     </svg>)
//   );
// }
