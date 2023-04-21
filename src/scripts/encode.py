import os
import sys
from PIL import Image
from os import path as directoryPath

# Getting Python Argument Values...
filename = str(sys.argv[1])
key = str(sys.argv[2])
secretMessage = str(sys.argv[3])

filePath = directoryPath.abspath(rf'./public/original_files/{filename}')


def convert_bytes(size):  # This function converts bytes to Higher Sizes...
    """ Convert bytes to KB, or MB or GB"""
    for x in ['bytes', 'KB', 'MB', 'GB']:
        if size < 1024.0:
            return "%3.2f %s" % (size, x)
        size /= 1024.0


def LSBOperation(value, bit):  # This function performs LSB Operation...
    if (len(bit) > 0):
        result = bin(value)[2:]
        result = result.zfill(8)
        result = result[:-1]+str(bit)
        value = int(result, 2)
    return value


if (directoryPath.exists(filePath)):
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

    # print(original_extension)
    # print(original_format)
    # print(original_info)
    # print(original_mode)
    # print(original_palette)
    # print(original_size)

    try:
        # Create a list to hold the modified frames...
        modified_frames = []
        num_frames = image.n_frames

        # Frame & Pixel Information...
        resolution = list(map(int, original_size))
        pixelCount = resolution[0]*resolution[1]
        totalPixels = num_frames * pixelCount

        print("\nTotal GIF Frames == ", num_frames)
        print("Pixels per Frame == ", pixelCount)
        print("Total Pixel Count == ", totalPixels)

        # Secret Message Bits Calculation...
        hexMessage = secretMessage.split(":")
        hexBeforeColon = hexMessage[0]
        hexAfterColon = hexMessage[1]
        binaryString = ""

        print("\n---HEX TO BINARY CONVERSION RESULTS---")
        for char in secretMessage:
            if char == ":":
                binary_byte = "00111010"

            else:
                # Convert Character to Decimal
                decimal_byte = int(char, 16)

                # Convert decimal to binary and pad with leading zeros
                binary_byte = bin(decimal_byte)[2:].zfill(4)

            # Append binary byte to binary string
            binaryString += binary_byte

        # Operation Related Analysis...
        print("\nSECRET MESSAGE (HEX) == ", secretMessage)
        print("\nSECRET MESSAGE (BIN) == ", binaryString)
        print("\n---------OPERATIONAL ANALYSIS---------")
        print("Theoretical Binary Bits Length == ", (len(secretMessage)*4)+4)
        print("Calculated Binary Bits Length == ", len(binaryString))
        print("Bits Length Match == ",
              ((len(secretMessage)*4)+4) == len(binaryString))
        print("--------------------------------------")

        # LSB ALGORITHM OPERATIONS...
        hiddenBits = list(binaryString)
        hiddenBitsLength = len(binaryString)
        hiddenBits = [hiddenBits[i:i+3] for i in range(0, len(hiddenBits), 3)]
        bitIndex = 0

        stegoFilename = rf'{filename.replace(".gif","")}-{key}-{hiddenBitsLength}-stego.gif'
        stegoPath = directoryPath.abspath(
            rf'./public/result_files/{stegoFilename}')

        # Iterate over all frames in the GIF...
        for frame_idx in range(num_frames):
            # Select the current frame
            image.seek(frame_idx)

            # Convert the frame to RGB mode...
            rgb_frame = image.convert("RGB")

            # Get the pixel access object for the frame...
            pixels = rgb_frame.load()

            # Modify the pixel values as needed...
            for x in range(rgb_frame.width):
                for y in range(rgb_frame.height):

                    # Modifying Pixel Values...
                    if (bitIndex < len(hiddenBits)):
                        # print("BEFORE", pixels[x, y], type(pixels[x, y]))

                        # The "value" variable stores a tuple of RGB Values as (R,G,B)...
                        value = pixels[x, y]

                        # Hidden Bits to Pixel's (R,G,B) Mapping...
                        RBit, GBit, BBit = value[0], value[1], value[2]
                        bitList = hiddenBits[bitIndex]

                        if (len(bitList) == 3):
                            bit1, bit2, bit3 = bitList[0], bitList[1], bitList[2]
                        elif (len(bitList) == 2):
                            bit1, bit2, bit3 = bitList[0], bitList[1], ""
                        elif (len(bitList) == 1):
                            bit1, bit2, bit3 = bitList[0], "", ""
                        else:
                            bit1, bit2, bit3 = "", "", ""

                        # Performing LSB Operation...
                        pixels[x, y] = (LSBOperation(RBit, bit1), LSBOperation(
                            GBit, bit2), LSBOperation(BBit, bit3))

                        # print("AFTER", pixels[x, y], type(pixels[x, y]))

                        bitIndex += 1

                    else:
                        break

                else:
                    continue

                break

            # Convert the Modified Frame back to GIF mode...
            gif_frame = rgb_frame.convert(
                "P", dither=Image.NONE, palette=Image.ADAPTIVE, colors=256)

            # Appending the Modified Frame to the List...
            modified_frames.append(gif_frame)

        # Save the modified GIF file using the modified_frames list...
        modified_frames[0].save(
            stegoPath,
            save_all=True,
            append_images=modified_frames[1:],
            format="GIF",
            optimize=True
        )

        hexFile = open(directoryPath.abspath(
            rf'./public/txt/{stegoFilename.replace("gif","txt")}'), 'w')
        hexFile.write(secretMessage)
        hexFile.close()

        # Check Operation for Modified GIF File...
        if (directoryPath.exists(stegoPath)):
            originalFileSize = convert_bytes(directoryPath.getsize(filePath))
            stegoFileSize = convert_bytes(directoryPath.getsize(stegoPath))
            print(
                f"\n--SUCCESS--[ {filename.replace('.gif','')}-{key}-{hiddenBitsLength}-stego.gif ] File Saved Successfully!")
            print(f"--ORIGINAL FILE SIZE--[ {originalFileSize} ]")
            print(f"--STEGO FILE SIZE--[ {stegoFileSize} ]")

        else:
            print(
                f"--ERROR--Save Error for [ {filename.replace('.gif','')}-{key}-{hiddenBitsLength}-stego.gif ]")

    except Exception as error:
        pass

else:
    print("FILE DOES NOT EXIST")

exit()
