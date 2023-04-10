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
    RBit, GBit, BBit = value[0], value[1], value[2]
    result = bin(RBit)[2:]
    result = str(result.zfill(8))
    result = result[:-1]+str(bit)
    result = (int(result, 2), GBit, BBit)
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

    try:
        # Create a list to hold the modified frames...
        modified_frames = []
        num_frames = image.n_frames

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

        # Iterate over all frames in the GIF
        for frame_idx in range(num_frames):
            # Select the current frame
            image.seek(frame_idx)

            # Convert the frame to RGB mode
            rgb_frame = image.convert("RGB")

            # Get the pixel access object for the frame
            pixels = rgb_frame.load()

            # Modify the pixel values as needed
            for x in range(rgb_frame.width):
                for y in range(rgb_frame.height):

                    # Modifying Pixel Values...
                    if (bitIndex < len(hiddenBits)):
                        # print("BEFORE", pixels[x, y])

                        # Performing LSB Operation...
                        pixels[x, y] = LSBOperation(
                            pixels[x, y], hiddenBits[bitIndex])

                        # print("AFTER", pixels[x, y])

                        bitIndex += 1

            # Convert the Modified Frame back to GIF mode
            gif_frame = rgb_frame.convert(
                "P", dither=Image.NONE, palette=Image.ADAPTIVE, colors=256)

            # Appending the Modified Frame to the List...
            modified_frames.append(gif_frame)

        # Save the modified GIF file using the modified_frames list
        modified_frames[0].save(
            stegoPath,
            save_all=True,
            append_images=modified_frames[1:],
            format="GIF",
            optimize=True
        )

        # Check Operation for Modified GIF File...
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
