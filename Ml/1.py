import cv2
import pytesseract
import numpy as np

# Set tesseract path
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Read image
img = cv2.imread("gauge.jpg")

# ---- STEP 1 : Crop gauge area (adjust coordinates if needed) ----
gauge = img[200:850, 520:600]

# ---- STEP 2 : Convert to grayscale ----
gray = cv2.cvtColor(gauge, cv2.COLOR_BGR2GRAY)

# ---- STEP 3 : Remove noise ----
blur = cv2.GaussianBlur(gray,(5,5),0)

# ---- STEP 4 : Threshold for OCR ----
thresh = cv2.adaptiveThreshold(
    blur,255,
    cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
    cv2.THRESH_BINARY,
    11,2
)

# ---- STEP 5 : OCR (numbers only) ----
config = "--psm 6 -c tessedit_char_whitelist=0123456789"
numbers = pytesseract.image_to_string(thresh, config=config)

print("Detected Numbers:", numbers)

# ---- STEP 6 : Detect water line ----
edges = cv2.Canny(gray,50,150)

lines = cv2.HoughLinesP(edges,1,np.pi/180,100,minLineLength=50,maxLineGap=10)

water_y = None

if lines is not None:
    for line in lines:
        x1,y1,x2,y2 = line[0]

        # horizontal line detection
        if abs(y1 - y2) < 5:
            water_y = y1
            cv2.line(gauge,(x1,y1),(x2,y2),(0,0,255),2)
            break

# ---- STEP 7 : Calculate water level ----
gauge_top = 0
gauge_bottom = gauge.shape[0]

if water_y is not None:

    percentage = (water_y - gauge_top) / (gauge_bottom - gauge_top)

    max_gauge = 8   # gauge maximum value

    water_level = percentage * max_gauge

    print("Estimated Water Level:", round(water_level,2), "meters")

# ---- Display result ----
cv2.imshow("Gauge", gauge)
cv2.imshow("Threshold", thresh)

cv2.waitKey(0)
cv2.destroyAllWindows()