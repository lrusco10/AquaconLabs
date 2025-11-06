
    const fish = [
      {text: '><(((°>  ', color: '#fff'},
      {text: '><>      ', color: '#fff'},
      {text: '><{{{°>  ', color: '#00ffff'},
      {text: '>=====*> ', color: '#00ffff'},
      {text: '><o>     ', color: '#00ffff'},
      {text: '}<>{{0}}3', color: '#00ffff'}
    ];
    let pos = 0;


    function getCharWidth() {
      const span = document.createElement('span');
      span.textContent = 'M'; // typical monospace width
      span.style.fontFamily = 'monospace';
      span.style.visibility = 'hidden';
      document.body.appendChild(span);
      const width = span.getBoundingClientRect().width;
      span.remove();
      return width;
}

    function getDimensions() {
      const fontSize = 16;
      const charWidth = getCharWidth();
      const charsPerLine = Math.floor(window.innerWidth / charWidth);
      const linesPerPage = Math.floor(window.innerHeight / fontSize);
      return { charsPerLine, linesPerPage };
}

    function drawAquarium() {
      const { charsPerLine, linesPerPage } = getDimensions();
      let aquarium = '';
      for (let i = 0; i < linesPerPage; i++) {
        let offset = (pos + i * 30) % (charsPerLine - 10);

        const fishObj = fish[i % fish.length];
        let fishSpan = `<span style="color: ${fishObj.color}">${fishObj.text}</span>`;
        // Pad remaining spaces with &nbsp; for HTML
        let row = '&nbsp;'.repeat(offset) + fishSpan;
        let neededSpaces = charsPerLine - offset - fishObj.text.length;
        if (neededSpaces > 0) {
          row += '&nbsp;'.repeat(neededSpaces);
        }
        aquarium += row + '<br>'; 
      }
  document.getElementById('ascii-bg').innerHTML = aquarium;
  pos = (pos + 1) % charsPerLine;
}

    drawAquarium();
    setInterval(drawAquarium, 200);
    window.addEventListener('resize', drawAquarium); // Redraw on resize
