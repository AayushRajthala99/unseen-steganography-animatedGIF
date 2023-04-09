import os
import sys
from PIL import Image, ImageSequence

# Getting Python Argument Values...
filename = str(sys.argv[1])
key = str(sys.argv[2])

# Appending '#' as Terminating Character of Secret Message... [ ASCII '#' = BIN '00100011' ]
secretMessage = f"{str(sys.argv[3])}#"

filePath = os.path.abspath(rf'./public/original_files/{filename}')
stegoPath = os.path.abspath(
    rf'./public/result_files/{filename.replace(".gif","")}-stego.gif')


def LSBOperation(value, bit):  # This function performs LSB Operation...
    result = bin(value)[2:]
    result = str(result.zfill(8))
    result = result[:-1]+str(bit)
    result = int(result, 2)
    return result


if (os.path.exists(filePath)):
    # Open the GIF file...
    image = Image.open(filePath)

    # Get the original image information
    original_format = image.format
    original_size = image.size
    original_mode = image.mode
    original_info = image.info
    original_palette = image.palette
    if ('extension' in image.info):
        original_extension = image.info["extension"]
    else:
        original_extension = None

    # Create a list to store the pixel values of each frame
    try:
        # Loop over each frame and convert to PIL Image object
        frames = []
        for frame in ImageSequence.Iterator(image):
            frames.append(frame.convert('P', palette=Image.ADAPTIVE))

        num_frames = len(frames)
        original_format = image.format
        original_size = image.size
        original_mode = image.mode
        original_info = image.info
        original_palette = image.palette
        if ('extension' in image.info):
            original_extension = image.info["extension"]
        else:
            original_extension = None

        # Appending 128 value to last 3 pixels to help in identifying
        # If the selected GIF File is a Stego File or Not...

        # frames[-1][-3] = 128
        # frames[-1][-2] = 128
        # frames[-1][-1] = 128

        # Frame & Pixel Information...

        resolution = list(map(int, original_size))
        pixelCount = resolution[0]*resolution[1]
        totalPixels = num_frames * pixelCount
        totalBitsCount = len(secretMessage) * 8

        print("\n\nTotal GIF Frames == ", num_frames)
        print("Pixels per Frame == ", pixelCount)
        print("Total Pixel Count == ", totalPixels)

        # Secret Message Bits Calculation...
        hex = secretMessage
        binaryString = ''

        print("\n---HEX TO BINARY CONVERSION RESULTS---")
        for i in range(len(hex)):
            char = ord(hex[i])
            binary = bin(char)[2:]
            binary = binary.zfill(8)
            binaryString += binary
            # print(hex[i], binary)
            if (hex[i] == '#'):
                break

        # Operation Related Analysis...
        print("\nSECRET MESSAGE (HEX) == ", hex)
        print("\nSECRET MESSAGE (BIN) == ", binaryString)
        print("\n---Operation Analysis---")
        print("Theoretical Binary Bits Length == ", len(hex*8))
        print("Calculated Binary Bits Length == ", len(binaryString))
        print("Bits Length Match == ", (len(hex*8)) == len(binaryString))

        # LSB ALGORITHM OPERATIONS...
        hiddenBits = list(binaryString)
        print(hiddenBits)
        bitIndex = 0
        for frame in frames:
            pixels = frame.load()
            for x in range(frame.width):
                for y in range(frame.height):
                    # Modify pixel value...
                    if (bitIndex < len(hiddenBits)):
                        print("BEFORE", pixels[x, y])

                        # Performing LSB Operation...
                        pixels[x, y] = LSBOperation(
                            pixels[x, y], hiddenBits[bitIndex])

                        bitIndex += 1
                        print("AFTER", pixels[x, y])

        # Creating a new Stego GIF Image File with the Modified Frames...
        new_gif = Image.new('P', frames[0].size)

        if image.getpalette() is not None:
            new_gif.putpalette(image.getpalette())

        new_gif.format = original_format
        new_gif.info = original_info

        if (original_extension):
            new_gif.info["extension"] = original_extension

        new_gif.save(stegoPath, save_all=True,
                     append_images=frames[1:])

        if (os.path.exists(stegoPath)):
            print(
                f"--SUCCESS--[ {filename.replace('.gif','')}-stego.gif ] File Saved Successfully!")
        else:
            print(
                f"--ERROR--File Save Error for [ {filename.replace('.gif','')}-stego.gif ]")

    except Exception as error:
        pass

else:
    print("FILE DOES NOT EXIST")

exit()
