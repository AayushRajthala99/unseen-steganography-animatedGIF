import os
import sys
from PIL import Image, ImageOps

# Getting Python Argument Values...
filename = str(sys.argv[1])
key = str(sys.argv[2])

# Appending '#' as Terminating Character of Secret Message...
secretMessage = f"{str(sys.argv[3])}#"

filePath = os.path.abspath(rf'./original_files/{filename}')

if (os.path.exists(filePath)):
    # Open the GIF file...
    with Image.open(filePath) as image:

        # Get the number of frames
        num_frames = 0

        try:
            while True:
                image.seek(image.tell() + 1)
                num_frames += 1
        except EOFError:
            pass

        # Create a list to store the pixel values of each frame
        try:
            frames = []
            for i in range(num_frames):
                # Seek to the i-th frame
                image.seek(i)
                greyImage = ImageOps.grayscale(image)

                # Convert the frame to a 2D array of pixel values
                frame = list(greyImage.getdata())
                frames.append(frame)
        # The frames list now contains a list of 2D arrays, where each 2D array represents a frame of the GIF
        # print(num_frames, len(frames[0]))

            totalFrames = num_frames * len(frames[0])
            totalBitsCount = len(secretMessage) * 8
            print("\nTotal GIF Frames == ", totalFrames)

            # keyValue to specify pixel gaps to hide secret bits...
            keyValue = int(key, 16) % 256

            # Secret Message Bits Calculation...
            hex = secretMessage
            binaryString = ''

            print("\n---HEX TO BINARY CONVERSION RESULTS---")
            for i in range(len(hex)):
                char = ord(hex[i])
                binary = bin(char)[2:]
                binary = binary.zfill(8)
                binaryString += binary
                print(hex[i], binary)
                if (hex[i] == '#'):
                    break

            print("\nSECRET MESSAGE (HEX) == ", hex)
            print("SECRET MESSAGE (BIN) == ", binaryString)
            print("Theoretical Binary Bits Length == ", len(hex*8))
            print("Calculated Binary Bits Length == ", len(binaryString))
            print("Bits Length Match == ", (len(hex*8)) == len(binaryString))

        except Exception as error:
            pass

else:
    print("FILE DOES NOT EXIST")

exit()
