import os
import nltk

# Create directory if it doesn't exist
nltk_data_dir = "./nltk_data"
if not os.path.exists(nltk_data_dir):
    os.makedirs(nltk_data_dir)
    print(f"Created directory: {nltk_data_dir}")

# Set NLTK data path
nltk.data.path.insert(0, nltk_data_dir)

# Download required NLTK resources
print("Downloading NLTK resources...")
nltk.download('stopwords', download_dir=nltk_data_dir)
nltk.download('punkt', download_dir=nltk_data_dir)
nltk.download('wordnet', download_dir=nltk_data_dir)

# Verify downloads
try:
    from nltk.corpus import stopwords
    words = stopwords.words('english')
    print(f"Successfully loaded {len(words)} stopwords")
except Exception as e:
    print(f"Error verifying stopwords: {e}")

try:
    from nltk.stem import WordNetLemmatizer
    lemmatizer = WordNetLemmatizer()
    test = lemmatizer.lemmatize("running")
    print(f"Lemmatizer test: running -> {test}")
except Exception as e:
    print(f"Error verifying lemmatizer: {e}")

print("NLTK setup complete!")
print(f"NLTK data paths: {nltk.data.path}")