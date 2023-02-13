import os
import sys
from PIL import Image, ImageOps

# print(sys.argv)
filename = sys.argv[1]
key = sys.argv[2]
secretMessage = sys.argv[3]

filePath = os.path.abspath(rf'./original_files/{filename}')

if (os.path.exists(filePath)):
    print("FILE EXISTS")
    from PIL import Image

    # Open the GIF file
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
        frames = []
        for i in range(num_frames):
            # Seek to the i-th frame
            image.seek(i)
            greyImage = ImageOps.grayscale(image)

            # Convert the frame to a 2D array of pixel values
            frame = list(greyImage.getdata())
            frames.append(frame)
        # The frames list now contains a list of 2D arrays, where each 2D array represents a frame of the GIF
        print(num_frames, len(frames[0]))
        # print(frames)
else:
    print("FILE DOES NOT EXIST")

exit()
