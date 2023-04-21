import os
import sys
from PIL import Image
from os import path as directoryPath

# Getting Python Argument Values...
filename = str(sys.argv[1])

stegoPath = directoryPath.abspath(rf'./public/result_files/{filename}')


def LSBReversal(value):  # This function performs Reversal of LSB Operation...
    result = bin(value)[2:]
    result = str(result[-1])
    return result


# This function returns the hex value of a 4 bit binary value...
def returnHex(value):
    hexChunk = hex(int(value, 2))[2:]
    return (hexChunk)


if (directoryPath.exists(stegoPath)):
    hexFile = open(directoryPath.abspath(
        rf'./public/txt/{filename.replace("gif","txt")}'), 'r')
    hexString = hexFile.read()
    hexFile.close()

    hiddenBitsLength = len(hexString)*4+4

    # Open the GIF file...
    image = Image.open(stegoPath)

    try:
        # Calculating Number of Frames in the GIF File...
        num_frames = image.n_frames

        # Variables to Store LSB REVERSAL Results...
        count = 1
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

                    values = pixels[x, y]

                    # LSB REVERSAL OPERATION...
                    # Hidden Bits to Pixel's (R,G,B) Mapping...
                    bit1, bit2, bit3 = LSBReversal(values[0]), LSBReversal(
                        values[1]), LSBReversal(values[2])

                    binaryString += "0" or "1"
                    if count == hiddenBitsLength:
                        break
                    count += 1
                    # hiddenBits += bit1+bit2+bit3
                    # if len(hiddenBits) == hiddenBitsLength:
                    #     binaryString = hiddenBits
                    #     break

                else:
                    continue

                break

            else:
                continue

            break

        tempString = ""

        # Splitting BinaryList to 8 Bits Chunk...
        binaryList = [binaryString[i:i+8]
                      for i in range(0, len(binaryString), 8)]

        print("\n---BINARY TO HEX CONVERSION RESULTS---")
        for value in binaryList:
            value = value.zfill(8)

            if (value == "00111010"):
                tempString += ":"

            else:
                # Splitting 8 Bit Chunk to 2*4 Bits Chunk...
                value1 = value[:4]
                value2 = value[4:]

                tempString += returnHex(value1) + returnHex(value2)

        # print("SECRET MESSAGE (BIN) == ", binaryString)
        print("SECRET MESSAGE (HEX) == ", hexString)

    except Exception as error:
        pass
else:
    print("FILE DOES NOT EXIST")

exit()
