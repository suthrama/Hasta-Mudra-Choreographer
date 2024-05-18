document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const lyrics = e.target.result;
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
    getMudra(word).then(mudra => {
      const mudraElement = document.createElement('div');
      mudraElement.textContent = `${word}: ${mudra}`;
      mudrasOutput.appendChild(mudraElement);
    });
  });
}

async function getMudra(word) {
  const apiKey = '' //API KEY !!!;
  const endpoint = 'https://api.openai.com/v1/engines/davinci-codex/completions';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      prompt: `What is the Kuchipudi hand gesture (mudra) for the word "${word}"? Format like this: "${word}": name of mudra`,
      max_tokens: 10,
      temperature: 0.5
    })
  });

  const data = await response.json();
  const mudra = data.choices[0].text.trim();
  return mudra || 'Unknown mudra';
}