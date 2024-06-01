document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const lyrics = e.target.result;
      console.log('Lyrics loaded:', lyrics);  // Debug log
      displayLyrics(lyrics);
    };
    reader.readAsText(file);
  }
}

function displayLyrics(lyrics) {
  const lyricsOutput = document.getElementById('lyricsOutput');
  const mudrasOutput = document.getElementById('mudrasOutput');
  lyricsOutput.innerHTML = '';
  mudrasOutput.innerHTML = '';

  const words = lyrics.split(/\s+/);
  words.forEach(word => {
    const wordElement = document.createElement('span');
    wordElement.textContent = word + ' ';
    lyricsOutput.appendChild(wordElement);

    // Fetch and display mudra for each word
    getMudra(word).then(mudraData => {
      console.log('Mudra for word', word, ':', mudraData);  // Debug log
      const mudraElement = document.createElement('div');
      mudraElement.className = 'mudra';
      mudraElement.innerHTML = `
        <img src="${mudraData.image}" alt="${mudraData.mudra}">
        <span>${word}z ${mudraData.mudra}</span>
      `;
      mudrasOutput.appendChild(mudraElement);
      highlightWord(wordElement);
    }).catch(error => {
      console.error('Error fetching mudra for word', word, ':', error);  // Error handling
    });
  });
}

async function getMudra(word) {
  try {
    const response = await fetch('http://localhost:3000/get-mudra', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ word })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getMudra:', error);  // Error handling
    return { mudra: '', image: 'https://www.naatyaanjali.com/wp-content/uploads/2015/02/' + word + '.jpg' };
  }
}

function highlightWord(wordElement) {
  wordElement.classList.add('highlight');
  setTimeout(() => {
    wordElement.classList.remove('highlight');
  }, 2000);
}
