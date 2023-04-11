import os
import sys
from PIL import Image
from os import path as directoryPath

# Getting Python Argument Values...
filename = str(sys.argv[1])
key = str(sys.argv[2])

stegoPath = directoryPath.abspath(
    rf'./public/result_files/{filename.replace(".gif","")}-stego.gif')


# This function performs Reversal of LSB Operation...
def LSBReversal(value):
    result = bin(value)[2:]
    result = str(result.zfill(8))
    result = str(result[-1])
    return result


if (directoryPath.exists(stegoPath)):
    # Open the GIF file...
    image = Image.open(stegoPath)

    try:
        # Create a list to hold the modified frames...
        modified_frames = []
        num_frames = image.n_frames

        # LSB REVERSAL OPERATIONS...
        hiddenBits = ""
        binaryString = ""

        # This value represents "$#" in ASCII which is the terminating character...
        comparisonValue = "0010010000100011"

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

                    value = pixels[x, y]

                    # Hidden Bits to Pixel's (R,G,B) Mapping...
                    RBit, GBit, BBit = value[0], value[1], value[2]
                    bit1, bit2, bit3 = LSBReversal(
                        RBit), LSBReversal(GBit), LSBReversal(BBit)
                    hiddenBits += bit1
                    if ((len(hiddenBits) >= 16) and (hiddenBits[-16:] == comparisonValue)):
                        binaryString = hiddenBits
                        break

                    hiddenBits += bit2
                    if ((len(hiddenBits) >= 16) and (hiddenBits[-16:] == comparisonValue)):
                        binaryString = hiddenBits
                        break

                    hiddenBits += bit3
                    if ((len(hiddenBits) >= 16) and (hiddenBits[-16:] == comparisonValue)):
                        binaryString = hiddenBits
                        break
                else:
                    continue

                break

        hex = ""

        print("\n---BINARY TO HEX CONVERSION RESULTS---")
        for i in range(len(hex)):
            char = ord(hex[i])
            binary = bin(char)[2:]
            binary = binary.zfill(8)
            binaryString += binary
            # print(hex[i], binary)
            if (hex[i] == '#'):
                break

    except Exception as error:
        pass
else:
    print("FILE DOES NOT EXIST")

exit()
