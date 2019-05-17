const fs = require('fs');
const readLine = require('readline');

class File {
    constructor(path) {
        this._path = path;
    }

    getCollection() {
        return new Promise(res => {
            let arr = [];
            let parent = null;

            this.getLines().then((data) => {
                data.forEach(e => {
                    if (e.length == 7){
                        let aux = e[0];
                        e.splice(0, 1);
                        e.push(aux);

                    }
                    if (parent != null && e[0].split('')[0] != parent.split('')[0]) {
                        parent = null;
                    }

                    arr.push({
                        description: e[1],                 // string
                        classifier: e[0],                  // string
                        openingBalance: parseFloat(e[2]),  // number
                        debit: parseFloat(e[3]),           // number
                        credit: parseFloat(e[4]),          // number
                        finalBalance: parseFloat(e[5]),    // number
                        parent: parent,                     // null || string
                        access: e[6] ? e[6] : null
                    });
                    parent = e[0];
                });
                res(arr);
            });
        });
    }

    getLines() {
        return new Promise(res => {
            let arr = [];
            let rd = readLine.createInterface({
                input: fs.createReadStream(__dirname + this._path)
            });

            rd.on('line', (line) => {
                let obj = this.formatCode(line);
                if (obj != ''){ // Avoid pushing empty arrays
                    arr.push(obj);
                }
            });

            rd.on('pause', () => {
                res(arr);
            });
        });
    }

    formatCode(str) {
        // Remove only the dots that are with numbers
        let aStr = '';
        let dotAux = str.split('');
        for (let i = 0; i < dotAux.length; i++){
            if (dotAux[i] === '.'){
                if (!isNaN(dotAux[i-1])){
                    dotAux.splice(i, 1);
                }
            }
        }
        aStr = dotAux.join('');
        
        // Replace the comma's with dots
        let filteredDots = aStr.split(',').join('.');
        
        // Split by tabs or 2 spaces
        let aux = String(filteredDots.split('  '));
        if (str.indexOf('\t') != -1){
            aux = String(filteredDots.split('\t'))
        }

        // Remove empty (trash) objects inside the array
        let arr = aux.split(',').filter(a => a);
        
        // Remove addicional spaces and useless Money Letters
        for (let i = 0; i < arr.length; i++) {
            arr.splice(i, 1, arr[i].trim());
            if (arr[i] === 'D' || arr[i] === 'C'){
                arr.splice(i, 1);
            }
        }
        // Remove the headers
        if (arr.length < 6 || isNaN(parseFloat(arr[5]))){
            return [''];
        }
        return arr;
    }
}

module.exports = File;