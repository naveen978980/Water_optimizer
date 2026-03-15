import cv2
import numpy as np

img = cv2.imread("2.jpg")

gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

edges = cv2.Canny(gray,50,150)

h,w = gray.shape

# detect water line
water_y = None

for row in range(h-1,0,-1):

    edge_pixels = np.sum(edges[row])

    if edge_pixels > w*10:
        water_y = row
        break

print("Water pixel:",water_y)

# example calibration
top_mark = 80
bottom_mark = 280

pixels_per_meter = (bottom_mark - top_mark) / 0.80

water_level = (water_y - top_mark) / pixels_per_meter

print("Water Level =",round(water_level,2),"meters")

cv2.line(img,(0,water_y),(w,water_y),(0,0,255),2)

cv2.imshow("Water Level",img)

cv2.waitKey(0)
cv2.destroyAllWindows()