/*
    Ananya Suthram
    6/11/2024

    Background.js is the backend file for the chrome extension project. 
    This is a file that is expected, otherwise the chrome extension will not run. 
    This program reads the audio transcript txt file, splits the text,
    displays the lyrics on the extension, get mudra pictures that best represents the transcripted word 
    and highlights the first five mudras it is currently getting suggestions for.

*/

document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);

/*
  handleFileSelect() Handles the file selection event.
  
  This function is triggered when a file is selected from an input element. It reads the 
  selected file as text and passes the content to the displayLyrics function.

 */
function handleFileSelect(event) {
  // Get the first file from the file input element
  const file = event.target.files[0];

  // Check if a file was selected
  if (file) {
    // Create a new FileReader instance
    const reader = new FileReader();

    // Define the onload event handler for the FileReader
    reader.onload = function(e) {
      const lyrics = e.target.result;
      console.log('Lyrics loaded:', lyrics);  // Debug log

      // Call the displayLyrics function with the loaded lyrics
      displayLyrics(lyrics);
    };

    reader.readAsText(file);
  }
}


/*
  displayLyrics() Populates HTML elements with the provided lyrics and associated mudra images.
 
  This function takes the lyrics as a parameter, clears the contents of the HTML elements
  with IDs 'lyricsOutput' and 'mudrasOutput', splits the lyrics into words, and creates a 
  span element for each word. Each word span is appended to the 'lyricsOutput' element.
  For each word, it fetches the corresponding mudra image and displays it in the 'mudrasOutput' element.
 */
function displayLyrics(lyrics) {
  // Get the HTML elements where the lyrics and mudras will be displayed
  const lyricsOutput = document.getElementById('lyricsOutput');
  const mudrasOutput = document.getElementById('mudrasOutput');
  
  // Clear the current content 
  lyricsOutput.innerHTML = '';
  mudrasOutput.innerHTML = '';

  // Split the lyrics into individual words
  const words = lyrics.split(/\s+/);

  // process each word
  words.forEach(word => {
    // Create a span element for each word and append it to the lyricsOutput element
    const wordElement = document.createElement('span');
    wordElement.textContent = word + ' ';
    lyricsOutput.appendChild(wordElement);

    // Fetch and display mudra for each word
    getMudra(word).then(mudraData => {
      console.log('Mudra for word', word, ':', mudraData);  // Debug log

      // Create an element to display the mudra image and word
      const mudraElement = document.createElement('div');
      mudraElement.className = 'mudra';
      mudraElement.innerHTML = `
        <img src="${mudraData.image.link}" alt="${word}">
        <span>${word}</span>
      `;

      // Append the mudra element to the mudrasOutput element
      mudrasOutput.appendChild(mudraElement);

      // Highlight the corresponding word element
      highlightWord(wordElement);
    }).catch(error => {
      // Log any errors encountered during the fetch process
      console.error('Error fetching mudra for word', word, ':', error);  // Error handling
    });
  });
}

/*
  getMudra() Fetches the mudra image for a given word using the Google Custom Search API. 
  If an error occurs during the fetch process, it logs the error to the console and returns null.
 */
async function getMudra(word) {
    // API key and custom search engine ID
    const apiKey = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
    const cx = 'xxxxxxxxxxxxxxxxxxxxxxx';
    
    // Construct the API URL for the Google Custom Search API
    const apiUrl = `https://www.googleapis.com/customsearch/v1?q=${word}&key=${apiKey}&cx=${cx}&searchType=image`
  
    try {
      // Fetch the data from the API
      const response = await fetch(apiUrl);

      // Check if the response is not OK
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Parse the response as JSON
      const data = await response.json();

      // Return the first image result
      return {image: data.items[0]};
    } catch (error) {
      // Log any errors that occur during the fetch process
      console.error('Error fetching image:', error);
      
      // Return null if an error occurs
      return null;
    }
  }

/*
  highlightWord() Highlights a word element temporarily.
 
  This function takes a word element as a parameter, adds a CSS class 'highlight' to it,
  and after a delay of 2 seconds, removes the 'highlight' class from the element.
  This visually emphasizes the word in the transcript for a brief period, helping users see which part of the text 
  is being referenced or suggested.
 */

function highlightWord(wordElement) {
  // Add the 'highlight' class to the word element
  wordElement.classList.add('highlight');

  // Set a timeout to remove the 'highlight' class after 2 seconds
  setTimeout(() => {
    wordElement.classList.remove('highlight');
  }, 2000);
}

// add event-listener for the download-button click event
document.getElementById('download-button').addEventListener('click', () => {
  // Get the URL of the popup.html file
  const popupUrl = chrome.runtime.getURL('popup.html');

  // Initiate the download. This will merely download the popup.html file without the updated content. (security reasons)  
  chrome.downloads.download({
      url: popupUrl,
      filename: 'popup.html', // Specify the filename for the downloaded file
      saveAs: true 
  });
});

// ------------------------------------------------------------------------------------------------- //

/*
  getDescription() Fetches a symbolic description for a given word using the OpenAI API.
 
  This asynchronous function constructs a prompt using the given word, sends the prompt to the OpenAI API,
  and retrieves a symbolic description in paragraph format, limited to 30 words or less.
  If an error occurs during the API call, it alerts the user and logs the error to the console.

  *** NOTE: ch. Hence this is not being called anywhere! ***
  I had put a lot of effort into trying to get to a work around after the paywall and did not want to minimize my efforts by deleting it 
  and wanted to take this as a learning oppurtunity! A description of the mudra was not requried as per my spec doc. (only image) but I thought it was worth testing
  and could of been helpful
 */
async function getDescription(word) {
  // Construct the prompt using the provided word
  const prompt = "the mudra is " + word + " tell me what all it can symbolize in paragraph format in 30 words or less. Do not give me a description of the mudra.";

  // Check if the prompt is valid
  if (!prompt) {
      alert('Prompt error.');
      return;
  }

  // OpenAI API key and URL 
  const openAiapiKey = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
  const openAiapiUrl = 'https://api.openai.com/v1/chat/completions';
  var response;

  // Define the request payload for the OpenAI API
  const data = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  }

  // call Open AI API with the prompt
  fetch(openAiapiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openAiapiKey}`,
    },
    body: JSON.stringify(data)
  })
  .then(response => {
    // Check if the response is not OK 
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse the response as JSON
    return response.json();
  })
  .then(data => {
    // Extract the response content from the OpenAI API response
    response = data.choices[0].message.content;
    console.log(response); // debug log

    // Return the formatted response
    return response;
  })
  .catch(error => {
    // Alert the user and log any errors that occur during the fetch process
    alert('Error fetching data from OpenAI API.'+ error);
    console.error('Error fetching data from OpenAI API:', error);
  });
}