'use client'

import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent, DropdownMenu } from "@/components/ui/dropdown-menu"
import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import NextImage from "next/image"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import brands from '@/config/brands';
import config from '@/config';
import { downloadFile } from '@/lib/file';
import HelpComponent from "./ui/help"
import Switch from "./ui/switch"
import { resetToDefault, resetStates } from "@/lib/helper-func"
import Compressor from 'compressorjs';
import GradientSwitch from "./ui/GradientToggle"
import IconToggle from "./ui/IconToggle"
import FilterSelector from "./ui/FilterSelector"

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
  const [xPosition, setXPosition] = useState(350);
  const [yPosition, setYPosition] = useState(config.defaultTextTargetPositionTopRatio);
  const [letterSpacing, setLetterSpacing] = useState(config.defaultLetterSpacing);
  const [devActive, setDevActive] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [buttonActive, setButtonActive] = useState('normal');
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 });
  const [cropEnd, setCropEnd] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isCropped, setIsCropped] = useState(false);
  const [croppedImageUrl, setCroppedImageUrl] = useState('');
  const [isGradientSelected, setIsGradientSelected] = useState(false);
  const [minYPosition, setMinYPosition] = useState(null);
  const [maxYPosition, setMaxYPosition] = useState(null);
  const [minXPosition, setMinXPosition] = useState(null);
  const [maxXPosition, setMaxXPosition] = useState(null);
  const [isIconEnabled, setIsIconEnabled] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [lineHeight, setLineHeight] = useState(1.2); // Default line height
  const [canvasWidth, setCanvasWidth] = useState(1600); // Default canvas width


  // REFs
  const canvasRef = useRef(null);

  // Handle segment selection
  const handleSegmentSelect = (segment) => {
    // Set selected segment
    setSelectedSegment(segment); // Update the selected segment state 
    console.log('Selected Segment:', segment);
    // Set font size
    if (typeof segment.fontSize === 'number') {
      setFontSize(segment.fontSize);
    } else {
      setFontSize(config.defaultFontSize);
    }
    
    // Set Text X Position
    if (typeof segment.textXPosition === 'number') {
      setXPosition(segment.textXPosition)
    }

    // Set Text Y Position
    if (typeof segment.defaultTextTargetPositionTopRatio === 'number') {
      setYPosition(segment.defaultTextTargetPositionTopRatio)
    }


    // Set Letter Spacing
    if (typeof segment.letterSpacing === 'number') {
      setLetterSpacing(segment.letterSpacing)
    }

    // Set text
    if (text && segment.id !== 'access-exclusive') {
      setText(text);
    } else if (segment.text) {
      setText(segment.text);
    } else {
      setText('');
    }

    // Set the width of the canvas
    if (segment.canvasWidth) {
      setCanvasWidth(segment.canvasWidth);
    }

    setDevActive(false); // Reset the dev toggle

    // Set the line height
    setLineHeight(segment.lineHeight || 1.2);

    // Set the Button Active State to Normal when a segment is selected
    setButtonActive('normal');
  };

  
  // Check if text input should be enabled
  const isTextInputEnabled = useMemo(() => {
    if (!selectedSegment) {
      return false;
    }
    
    return selectedSegment.hasCustomText === true;
  }, [selectedSegment]);
  
  // useEffect to set devActive to false when text input is disabled
  useEffect(() => {
    if (!isTextInputEnabled) {
      setDevActive(false);
    }
    console.log('isTextInputEnabled:', isTextInputEnabled);
  }, [isTextInputEnabled]);

  // Clear the text input when the segment changes
  useEffect(() => {
    if (!isTextInputEnabled && !selectedSegment.text) {
      setText(''); // Clear the text input
      setSecondText(''); // Clear the second text input
    } else if (!selectedSegment.hasSecondText) {
      setSecondText(''); // Clear the second text input
    }

    // Resest the YPosition Value when the segement is changed 
    if (selectedSegment.textTargetPositionTopRatio) {
      setYPosition(selectedSegment.textTargetPositionTopRatio)
    }
    
  }, [selectedSegment, isTextInputEnabled]); 

  // Handle brand selection
  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand); // Update the selected brand state

    if (brand.minYPosition !== null) { // Check if the brand has a minYPosition value
      setMinYPosition(brand.minYPosition) // Set the minYPosition value
    }

    if (brand.maxYPosition !== null) { // Check if the brand has a maxYPosition value
      setMaxYPosition(brand.maxYPosition) // Set the maxYPosition value
    }

    if (brand.minXPosition !== null) { // Check if the brand has a minXPosition value
      setMinXPosition(brand.minXPosition) // Set the minXPosition value
    }

    if (brand.maxXPosition !== null) { // Check if the brand has a maxXPosition value
      setMaxXPosition(brand.maxXPosition) // Set the maxXPosition value
    }

    if (brand.segments && brand.segments.length > 0) {
      handleSegmentSelect(brand.segments[0]);
    }

    setIsIconEnabled(false); // Reset the icon toggle
  }

  const handleTextChange = (e) => {
    setText(e.target.value); // Update text state on change
  };

  // Function to handle image loading onto canvas
  const loadImageOnCanvas = useCallback(() => {
    const canvas = canvasRef.current; // Get the canvas element
    const ctx = canvas.getContext('2d'); // Get the canvas context
    const img = new Image(); // Create a new image object
    img.src = imageUrl; // Set the image source to the image URL
    img.onload = () => { // When the image is loaded we will draw it on the canvas with the cropping area if defined
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      /**
       * testing fancy stuff
       */
      // const scannedImage = ctx.getImageData(0, 0, canvas.width, canvas.height); // this will give me the image data of the canvas
      // console.log('scannedImage:', scannedImage);
      // const scannedData = scannedImage.data; // this will give me the pixel data of the image
      // for (let i = 0; i < scannedData.length; i += 4) {
      //   const total = scannedData[i] + scannedData[i + 1] + scannedData[i + 2]; // Get the total color value
      //   const averageColorValue = total / 3; // Get the average color value
      //   scannedData[i] = averageColorValue; // Set the red channel
      //   scannedData[i + 1] = averageColorValue; // Set the green channel
      //   scannedData[i + 2] = averageColorValue; // Set the blue channel
      // }
      // scannedImage.data = scannedData; // Set the new pixel data
      // ctx.putImageData(scannedImage, 0, 0); // Put the new image data back on the canvas

      // Draw the cropping area if defined
      if (cropEnd.x !== cropStart.x && cropEnd.y !== cropStart.y) {
        // Draw the cropping area if defined
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        ctx.setLineDash([15, 10]);
        ctx.beginPath();
        ctx.rect(
          cropStart.x,
          cropStart.y,
          cropEnd.x - cropStart.x,
          cropEnd.y - cropStart.y
        );
        ctx.stroke();
      }
    };
  }, [imageUrl, cropStart, cropEnd]);

  const getMousePos = (canvas, evt) => {
    const rect = canvas.getBoundingClientRect(); // Gets the canvas position relative to the viewport
    return {
      x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
      y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e) => {
      const pos = getMousePos(canvas, e);
      setCropStart(pos);
      setCropEnd(pos); // Initially, end is the same as start
      setIsDragging(true);
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const pos = getMousePos(canvas, e); // Get the current mouse position and update the crop end
      setCropEnd(pos);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Optionally, redraw the canvas here if needed right after the crop area is selected
      // displayCroppedImage();
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, loadImageOnCanvas]); // Make sure to include all dependencies in this array

  // Function to calculate file size from base64 string
  function calculateFileSizeFromDataURL(dataURL) {
    const head = 'data:image/png;base64,'.length; // Adjust based on actual MIME type if necessary
    const fileSizeBytes = (dataURL.length - head) * 3 / 4; // Base64 encoding inflates size by 33%
    return fileSizeBytes;
  }


  const displayCroppedImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = imageUrl; // The source image URL

    img.onload = () => {
        // Calculate the top-left corner and dimensions of the cropping rectangle
        const minX = Math.min(cropStart.x, cropEnd.x);
        const minY = Math.min(cropStart.y, cropEnd.y);
        const width = Math.abs(cropEnd.x - cropStart.x);
        const height = Math.abs(cropEnd.y - cropStart.y);

        if (width < 100 || height < 100) {
            alert('Please select a larger crop area');
            return;
        }

        // Adjust canvas size to match the crop area
        canvas.width = width;
        canvas.height = height;

        // Clear the canvas and draw the cropped section
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setCropStart({ x: 0, y: 0})
        setCropEnd({ x: 0, y: 0})

        ctx.drawImage(img, minX, minY, width, height, 0, 0, width, height);

        const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.8); // this will compress the image to 80% quality jpeg
        const croppedImageSize = calculateFileSizeFromDataURL(croppedImageUrl);

        const maxFileSize = 7.6 * 1024 * 1024; // Example: 3.2 MB in bytes
        console.log('Cropped Image Size:', croppedImageSize);
        if (croppedImageSize > maxFileSize) {
          alert('Reduce Crop Area: Cropped image size exceeds 3.2MB limit.');
          // Handle the situation, e.g., by not updating the image URL or asking the user to crop a smaller area
        } else {
          setCroppedImageUrl(croppedImageUrl); // Update state with the cropped image URL
          setImageUrl(croppedImageUrl); // Update imageUrl with the cropped image
          setIsCropped(true); // Set the cropped state to true
        }
    };
  }, [cropStart, cropEnd, imageUrl]);  

  // For when the image is selected
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log('File:', file);
    const maxFileSize = 3.2 * 1024 * 1024; // 5MB in bytes
    if (file) {
      if (file.size >= maxFileSize) {
        alert("File size should not exceed 3.2MB.");
        return; // Exit the function if file is too large
      }
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
        setCroppedImageUrl(reader.result); // Store the cropped image URL to avoid the previous image being displayed that was cropped
        setOriginalImageUrl(reader.result); // Store the original image URL
      };
      reader.readAsDataURL(file);
    }
  };

  // Pass the Data to the Backend
  async function handleSubmit(e) {
    e.preventDefault();

    setIsLoading(true); // Start loading

    const imageToSend = isCropped ? croppedImageUrl : originalImageUrl;
  
    // Prepare the data as a JSON object
    const data = {
      brandId: selectedBrand.id,
      segmentId: selectedSegment.id,
      text: text,
      secondText: secondText,
      file: imageToSend,
      fontSize: fontSize,
      xPosition: xPosition,
      yPosition: yPosition,
      letterSpacing, letterSpacing,
      isGradientSelected: isGradientSelected,
      isIconEnabled: isIconEnabled,
      filter: selectedFilter,
      lineHeight: lineHeight,
      canvasWidth: canvasWidth,
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

  // Listen for cmd + enter to submit the form
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.metaKey && e.key === 'Enter') {
        handleSubmit(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSubmit]);

  // Function to download the image
  const downloadImage = async (dataUrl) => {
    downloadFile({ dataUrl, fileName: 'thumbnail.jpeg' });
  };

  // look for changes in the imageUrl state
  useEffect(() => {
    if (imageUrl) {
      // Create the thumbnail
      console.log('imageUrl changed');
      loadImageOnCanvas();
    }
  }, [imageUrl, loadImageOnCanvas]);

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
      const base64String = reader.result; // Store the base64 string
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
    exit: { 
      opacity: 0, 
      x: -20,
      transition: { duration: 0.4 } // Faster exit transition
    },
    transition: { type: 'spring', damping: 30, stiffness: 200, mass: 5 }
  }

  // ----- Fetch YouTube Thumbnail ----------------------------------------------
  async function fetchYoutubeThumbnail(e) {
    e.preventDefault();
    setIsLoading(true);

    const query = {
      youtubeUrl: youtubeUrl,
    }
  
    try {
      const response = await fetch('/youtube/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      });

      const responseData = await response.json();
      console.log('Success:', responseData);
      if (response.ok) {
        setImageUrl(responseData.base64Image); // Use the thumbnail URL from the response
        isCropped && setCroppedImageUrl(responseData.base64Image); // Update the cropped image URL // CHECK THIS!!!!!! 3.22.24
        setOriginalImageUrl(responseData.base64Image); // Store the original image URL
      } else {
        throw new Error(responseData.error || 'An error occurred');
      }
    } catch (error) {
      console.error('Error fetching thumbnail:', error.message);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  }
  // --------------------------------------------------------------------------

  // toggle gradient
  const toggleGradient = () => {
    setIsGradientSelected(!isGradientSelected);
  }
  useEffect(() => {
    console.log('gradient status:', isGradientSelected);
    console.log('icon status:', isIconEnabled)
  }
  , [isGradientSelected, isIconEnabled]);


  // Small / Large Font size button click function
  const handleFontSize = (size, position, buttonType) => {
    setFontSize(size);
    setButtonActive(buttonType);

    // Only adjust Y position for wayback-b and wayback-c segments
    if (selectedSegment.id === 'wayback-b' || selectedSegment.id === 'wayback-c') {
      setYPosition(position);
    }
  }

  return (
    (<Card className="my-10 lg:min-w-96 md:min-w-96 max-w-90w">
      <motion.form layout>
        <motion.div layout className="grid gap-4 md:grid-cols-5"> 
          <motion.div layout className="space-y-4 md:col-span-2">
            <CardHeader className="pb-0">
              <div className="flex flex-col">
                <CardTitle>Thumbnail Generator</CardTitle>
                <CardDescription>Only the best thumbnails</CardDescription>
              </div>
              <HelpComponent modalOpen={modalOpen} setModalOpen={setModalOpen} />
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
                <label className="text-sm font-medium mt-4">Series</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="!rounded-lg !text-left w-full" id="theme" variant="outline">
                      {selectedSegment ? selectedSegment.name : 'Select Series'}
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
              <div className="grid gap-2">
                <label className="text-sm font-medium mt-4">YouTube URL</label>
                <Input
                  className="w-full"
                  id="youtubeUrl"
                  placeholder="Enter YouTube video URL"
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  value={youtubeUrl}
                />
                <Button onClick={fetchYoutubeThumbnail} className="mt-2" variant="secondary" disabled={!youtubeUrl}>
                  Fetch Thumbnail
                </Button>
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

              {/* Gradient on off switch */}
              <motion.div className="flex justify-between items-center">
                <motion.div layout className="grid gap-2">
                  <label className="text-sm font-medium mt-4">Bottom Gradient</label>
                  <GradientSwitch setIsGradientSelected={setIsGradientSelected} isGradientSelected={isGradientSelected} />
                </motion.div>

                {/* Icon Toggle Switch */}
                {selectedSegment.hasIcon && (
                  <motion.div layout className="grid gap-2">
                  <label className="text-sm font-medium mt-4">Live Icon</label>
                  <IconToggle isIconEnabled={isIconEnabled} setIsIconEnabled={setIsIconEnabled} />
                </motion.div>
                )}
              </motion.div>
              
              {/* ----- Image Filter ----- */}
              <FilterSelector 
                  devActive={devActive} 
                  selectedFilter={selectedFilter}
                  setSelectedFilter={setSelectedFilter} 
                />

              {/* Text Input Fields */}
              <AnimatePresence mode="wait" >
              {selectedSegment.hasCustomText === true && (
                <motion.div 
                  layout
                  className="grid gap-2"
                  initial='hidden'
                  animate='visible'
                  exit='exit'
                  transition={{ type: 'spring', damping: 30, stiffness: 200, mass: 5 }}
                  variants={textVariants}
                  key='textFieldOne'
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
              </AnimatePresence>

              <AnimatePresence mode="wait" >
              {selectedSegment.hasCustomSecondText === true && (
                <motion.div 
                  layout
                  className="grid gap-2 text-sm font-medium mt-4"
                  initial='hidden'
                  animate='visible'
                  exit='exit'
                  transition={{ type: 'spring', damping: 30, stiffness: 200, mass: 5 }}
                  variants={textVariants}
                  key='textFieldTwo'
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
              </AnimatePresence>

              {/* SMALL AND NORMAL FONT SIZE BUTTONS */}
              <AnimatePresence mode="wait" >
              {selectedSegment.hasCustomText === true && (
                <motion.div 
                  layout
                  className="grid gap-2 mt-2"
                  initial='hidden'
                  animate='visible'
                  exit='exit'
                  transition={{ type: 'spring', damping: 30, stiffness: 200, mass: 5 }}
                  variants={textVariants}
                  key='textFieldOne'
                >
                  <div className="flex gap-4 items-center">
                    <label className="text-sm mr-10 font-medium mt-0" htmlFor="fontStandard">
                      Font Size
                    </label>
                    <Button 
                      type="button"
                      onClick={handleFontSize.bind(this, selectedSegment.normalFontSize, 0.305, 'normal')}  
                      className={`mt-2  ${buttonActive === 'normal' ? 'ring-2 dark:ring-gray-50 dark:bg-gray-700 bg-gray-300' : '' }`}
                      variant="outline"
                    >
                      Normal 
                    </Button>
                    <Button 
                      type="button"
                      onClick={handleFontSize.bind(this, selectedSegment.smallFontSize, 0.325, 'small')}
                      className={`mt-2  ${buttonActive === 'small' ? 'ring-2 dark:ring-gray-50 dark:bg-gray-700 bg-gray-300' : '' } `}
                      variant="outline"
                    >
                      Small 
                    </Button>
                  </div>
                </motion.div>
              )}  
              </AnimatePresence>

              {/* RESET AND DEV TOGGLE */}

              <AnimatePresence mode="wait" key={isTextInputEnabled ? 'editable' : 'non-editable'}> 
                {isTextInputEnabled && (
                  <motion.div 
                    layout
                    className="grid grid-cols-2 justify-between items-end gap-10"
                    initial='hidden'
                    animate='visible'
                    transition={{ type: 'spring', damping: 50, stiffness: 200, mass: 5, delay: 0.03 }}
                    exit='exit'
                    variants={textVariants}
                    key='buttons'
                    >
                    <Switch 
                      key='switch'
                      setDevActive={setDevActive}
                      devActive={devActive}
                      />
                    {devActive && (
                      <Button
                      type="button"
                      onClick={() => resetToDefault(selectedSegment, { setFontSize, setXPosition, setYPosition, setLetterSpacing })}
                      className=" mt-4"
                      variant="secondary"
                      key='resetButton'
                      >
                        Reset
                      </Button>
                    )}
                  </motion.div>
                )}

              {/* Font Size */}
              {devActive && isTextInputEnabled && (
                <>
                <motion.div 
                  layout
                  className="grid "
                  initial='hidden'
                  animate='visible'
                  transition={{ type: 'spring', damping: 50, stiffness: 200, mass: 5, delay: 0.06 }}
                  variants={textVariants}
                  exit='exit'
                  key='fontSizeSlider'
                >
                  <label htmlFor="fontSizeSlider" className="text-sm font-medium mt-4">Font Size - {fontSize}</label>
                  <div className="group relative">
                    <input
                      type="range"
                      id="fontSizeSlider"
                      name="fontSizeSlider"
                      min="90" // Minimum font size
                      max="195" // Maximum font size
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer dark:bg-gray-700"
                      />
                    {/* <div className="pointer-events-none absolute -top-8 left-1/2 transform -translate-x-1/2 z-10 backdrop-blur-sm dark:bg-slate-700 p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity delay-500 duration-300 text-sm">
                      Font Size Selector
                    </div> */}
                    <div className="flex justify-between text-xs px-2">
                      <span>90</span>
                      <span>195</span>
                    </div>
                  </div>
                </motion.div>
              </>
              )}
              
              {/* Font X Position */}
              {isTextInputEnabled && devActive && (
              <motion.div 
                layout
                className="grid gap-2"
                initial='hidden'
                animate='visible'
                transition={{ type: 'spring', damping: 50, stiffness: 200, mass: 5, delay: 0.09 }}
                variants={textVariants}
                exit='exit'
                key='xPositionSlider'
              >
                  <label htmlFor="fontSizeSlider" className="text-sm font-medium mt-4">Horizontal Text Position - {xPosition}</label>
                  <input
                    type="range"
                    id="fontSizeSlider"
                    name="fontSizeSlider"
                    min={minXPosition} // Minimum X Position 
                    max={maxXPosition} // Maximum X Position
                    value={xPosition}
                    onChange={(e) => setXPosition(e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-xs px-2">
                    <span>left</span>
                    <span>right</span>
                  </div>
              </motion.div>
              )}

              {/* Font Y Position */}
              {isTextInputEnabled && devActive && (
              <motion.div 
                layout
                className="grid gap-2"
                initial='hidden'
                animate='visible'
                transition={{ type: 'spring', damping: 50, stiffness: 200, mass: 5, delay: 0.1 }}
                variants={textVariants}
                exit='exit'
                key='yPositionSlider'
              >
                  <label htmlFor="fontSizeSlider" className="text-sm font-medium mt-4">Vertical Text Position - {yPosition}</label>
                  <input
                    type="range"
                    id="fontSizeSlider"
                    name="fontSizeSlider"
                    min={minYPosition} // Minimum y position
                    max={maxYPosition} // Maximum y position
                    value={(maxYPosition + minYPosition) - yPosition} // Adjust this calculation to invert the slider's effect
                    onChange={(e) => {
                      const sliderValue = e.target.value;
                      const invertedValue = (maxYPosition + minYPosition) - sliderValue; // Invert the calculation here
                      setYPosition(invertedValue.toFixed(3)); // Update yPosition based on the inverted calculation
                    }}
                    step="0.001"
                    className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-xs px-2">
                    <span>down</span>
                    <span>up</span>
                  </div>
              </motion.div>
              )}

              {/* Font Spacing Value */}
              {isTextInputEnabled && devActive && (
              <motion.div 
                layout
                className="grid gap-2"
                initial='hidden'
                animate='visible'
                transition={{ type: 'spring', damping: 50, stiffness: 200, mass: 5, delay: 0.2 }}
                variants={textVariants}
                exit='exit'
                key='letterSpacingSlider'
              >
                  <label htmlFor="fontSizeSlider" className="text-sm font-medium mt-4">Text Letter Spacing - {letterSpacing}</label>
                  <input
                    type="range"
                    id="fontSizeSlider"
                    name="fontSizeSlider"
                    min="0" // Minimum X Position 
                    max="8" // Maximum X Position
                    value={letterSpacing}
                    onChange={(e) => setLetterSpacing(e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer dark:bg-gray-700"
                    step='1'
                  />
                  <div className="flex justify-between text-xs px-2">
                    <span>0</span>
                    <span>8</span>
                  </div>
              </motion.div>
              )}

              {/* Line Height */}
              {isTextInputEnabled && devActive && (
                <>
                  <motion.div 
                    layout
                    className="grid gap-2"
                    initial='hidden'
                    animate='visible'
                    transition={{ type: 'spring', damping: 50, stiffness: 200, mass: 5, delay: 0.3 }}
                    variants={textVariants}
                    exit='exit'
                    key='lineHeightSlider'
                  >
                    <label htmlFor="lineHeightSlider" className="text-sm font-medium mt-4">Line Height - {lineHeight.toFixed(2)}</label>
                    <input
                      type="range"
                      id="lineHeightSlider"
                      name="lineHeightSlider"
                      min="1"
                      max="2"
                      step="0.05"
                      value={lineHeight}
                      onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer dark:bg-gray-700"
                    />
                    <div className="flex justify-between text-xs px-2">
                      <span>1</span>
                      <span>2</span>
                    </div>
                  </motion.div>

                {/* Canvas Width */}
                {selectedSegment.canvasWidth && (

                  <motion.div 
                  layout
                  className="grid gap-2"
                  initial='hidden'
                  animate='visible'
                  transition={{ type: 'spring', damping: 50, stiffness: 200, mass: 5, delay: 0.4 }}
                  variants={textVariants}
                  exit='exit'
                  key='canvasWidthSlider'
                  >
                    <label htmlFor="canvasWidthSlider" className="text-sm font-medium mt-4">Canvas Width - {canvasWidth}</label>
                    <input
                      type="range"
                      id="canvasWidthSlider"
                      name="canvasWidthSlider"
                      min="800"
                      max="1920"
                      step="10"
                      value={canvasWidth}
                      onChange={(e) => setCanvasWidth(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer dark:bg-gray-700"
                      />
                    <div className="flex justify-between text-xs px-2">
                      <span>800</span>
                      <span>1920</span>
                    </div>
                  </motion.div>
                  )}
                  </>
                )}
              </AnimatePresence>
               

              <motion.div layout>
                <Button onClick={handleSubmit} className="w-full my-4" disabled={isLoading} >
                  {isLoading ? 'Generating...' : 'Generate Thumbnail'}
                </Button>
                {imageUrl && (
                  <p onClick={() => {setImageUrl(originalImageUrl), setIsCropped(false)}} className="rounded-md px-4 py-2 text-sm text-center h-10 cursor-pointer transition-all duration-200 bg-red-500 text-gray-50 hover:bg-red-500/90 dark:bg-red-900 dark:text-gray-50 dark:hover:bg-red-900/90">
                    Reset Thumbnail
                  </p>
                  )}
              </motion.div>
            </CardContent>
          </motion.div>
          <motion.div
            className="border md:col-span-3 dark:border-gray-200 border-gray-800 rounded-lg p-4 flex h-full items-center justify-center"
            layout
            >
            {imageUrl ? (
               <div className="flex flex-col relative w-full aspect-video hover:cursor-crosshair">
                {/* Crop Icon */}
                <p onClick={displayCroppedImage} className="absolute group flex top-0 border-2 rounded-lg backdrop-blur-lg border-slate-800 px-2 py-2 text-sm text-slate-900 cursor-pointer right-0 mt-2 mr-2 hover:shadow-thicc bg-slate-50 transition-all duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path d="M6.13 1L6 16a2 2 0 002 2h15" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M1 6.13L16 6a2 2 0 012 2v15" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                <p className="pointer-events-none absolute sm:-top-14 -top-12 z-10 backdrop-blur-sm dark:bg-slate-700 p-2 rounded-md delay-700 left-0 w-max opacity-0 dark:text-gray-100 text-gray-900 bg-slate-800 transition-opacity group-hover:opacity-100">Crop</p>
                </p>
                {/* uncomment for tool-tip for cropping */}
                
                <canvas 
                  className="max-w-full"
                  ref={canvasRef}
                ></canvas>
                <Button
                  type="button"
                  onClick={() => downloadImage(imageUrl)} 
                  className="mt-4 relative"
                  variant="secondary"
                >
                  Download Image
                </Button>
              </div>
            ) : (
              <NextImage
                alt="Placeholder"
                className="object-cover h-50 w-90 rounded-lg"
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
      </motion.form>
    </Card>)
  );
}

