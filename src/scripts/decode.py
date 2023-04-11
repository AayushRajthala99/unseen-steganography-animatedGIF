import os
import sys
from PIL import Image
from os import path as directoryPath

# Getting Python Argument Values...
filename = str(sys.argv[1])
key = str(sys.argv[2])

stegoPath = directoryPath.abspath(rf'./public/result_files/{filename}')


def LSBReversal(value):  # This function performs Reversal of LSB Operation...
    result = bin(value)[2:]
    result = str(result.zfill(8))
    result = str(result[-1])
    return result


# This function returns the hex value of a 4 bit binary value...
def returnHex(value):
    decimal = int(value, 2)
    hexChunk = hex(decimal)[2:]
    print(hexChunk)
    return (hexChunk)


if (directoryPath.exists(stegoPath)):
    # Open the GIF file...
    image = Image.open(stegoPath)

    try:
        # Calculating Number of Frames in the GIF File...
        num_frames = image.n_frames

        # This value represents "$#" in ASCII which is the terminating character...
        comparisonValue = "0010010000100011"

        # Variables to Store LSB REVERSAL Results...
        hiddenBits = ""
        binaryString = ""

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

                    # LSB REVERSAL OPERATION...
                    bit1, bit2, bit3 = LSBReversal(
                        RBit), LSBReversal(GBit), LSBReversal(BBit)

                    hiddenBits += bit1
                    if ((len(hiddenBits) >= 16) and (hiddenBits[-16:] == comparisonValue)):
                        binaryString = hiddenBits[:-16]
                        break

                    hiddenBits += bit2
                    if ((len(hiddenBits) >= 16) and (hiddenBits[-16:] == comparisonValue)):
                        binaryString = hiddenBits[:-16]
                        break

                    hiddenBits += bit3
                    if ((len(hiddenBits) >= 16) and (hiddenBits[-16:] == comparisonValue)):
                        binaryString = hiddenBits[:-16]
                        break

                else:
                    continue

                break

        hexString = ""

        # Splitting BinaryList to 8 Bits Chunk...
        binaryList = [binaryString[i:i+8]
                      for i in range(0, len(binaryString), 8)]

        print("\n---BINARY TO HEX CONVERSION RESULTS---")
        for value in binaryList:
            if (value == "00111010"):
                hexString += ":"
            else:
                # Splitting 8 Bit Chunk to 2*4 Bits Chunk...
                value1 = value[:4]
                value2 = value[4:]

                hexString = hexString + returnHex(value1) + returnHex(value2)

        print("SECRET MESSAGE (BIN) == ", binaryString)
        print("SECRET MESSAGE (HEX) == ", hexString)

    except Exception as error:
        pass
else:
    print("FILE DOES NOT EXIST")

exit()
