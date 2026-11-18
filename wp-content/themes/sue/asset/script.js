    var fontType = ["as", "kom-200", "kom-400", "kom-800", "kom-1000", "kom-200"];
        
     // Shuffle function to randomize fontType array
        function shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }
        
        // Shuffle the fontType array
        var shuffledFonts = shuffle([...fontType]);

        // Ensure 'kom-1000' is not assigned to menu-2
        while (shuffledFonts[1] === 'kom-1000') {
            shuffledFonts = shuffle([...fontType]);
        }
        
        // "kom-*" fonts carry Latin only, so Korean text falls back to "as" (as-serif)
        function withFallback(font) {
            return font === "as" ? '"as"' : '"' + font + '", "as"';
        }

        // Assign fonts to div elements
        document.getElementById("menu-1").style.fontFamily = withFallback(shuffledFonts[0]);
        document.getElementById("menu-2").style.fontFamily = withFallback(shuffledFonts[1]);
        document.getElementById("menu-3").style.fontFamily = withFallback(shuffledFonts[2]);
        document.getElementById("menu-4").style.fontFamily = withFallback(shuffledFonts[3]);
        document.getElementById("menu-5").style.fontFamily = withFallback(shuffledFonts[4]);
        document.getElementById("menu-6").style.fontFamily = withFallback(shuffledFonts[5]);