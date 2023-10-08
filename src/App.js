import React, { useState } from "react";
import { ChakraProvider, Box, Button, Stack, Textarea, Input, Center, Text, Select, Checkbox } from '@chakra-ui/react';
import Papa from 'papaparse';


function Normalize() {
  const [text, setText] = useState("");
  const [sentences, setSentences] = useState([]);

  const [outputType, setOutputType] = useState("");
  const [outputType2, setOutputType2] = useState("");
  const [outputType3, setOutputType3] = useState("");
  const [outputType4, setOutputType4] = useState("");
  const [outputType5, setOutputType5] = useState("");

  const [checker, setChecker] = useState('');

  const[tokenizedWords, setTokenizedWords] = useState([]);

  const [message, setMessage] = useState('');

  var finalOutput;

  var counting = 1;

  var apiFile = "https://script.google.com/macros/s/AKfycbzscAWiTrL4Nwh7U7AGjCtAroPUGLUUsQ0gMSEkbBPayul7GyFl1rJJsTobJpiNi-3bgg/exec"
  
  const stopWords = ['ja', 'ty', 'to', 'mu', 'v', 'si', 'on', 'ona', 'ono', 'my', 'vy', 'oni', 'ony', 'môj', 'tvoj', 'jeho',
  'jej', 'náš', 'váš', 'ich', 'seba', 'svoj', 'sa', 'kto', 'čo', 'kde', 'ako',
  'kedy', 'prečo', 'koľko', 'ten', 'to', 'tam', 'takto', 'vtedy', 'preto', 'toľko',
  'a', 'i', 'ani', 'aj-aj', 'ba', 'ale', 'no', 'lež', 'jednako', 'alebo', 'buď', 'či',
  'buď-alebo', 'že', 'aby', 'čo', 'aký', 'ktorý', 'kde', 'odkiaľ', 'keď', 'kým',
  'vtedy-keď', 'akoby', 'lebo', 'pretože', 'bez', 'cez', 'do', 'k', 'medzi', 'na',
  'o', 'od', 'okrem', 'po', 'pod', 'pre', 'pred', 'pri', 'proti', 's', 'so', 'u',
  'z', 'zo', 'nuž', 'aspoň', 'bodaj', 'by', 'azda', 'však'];

  const removeStopWords= (input) => {
    const words = input.split(' ');
    const filteredWords = words.filter((word) => !stopWords.includes(word.toLowerCase()));
    return filteredWords.join(' ');
  }

  const convertText = (text) => {
    const numberRegex = /\d+/g;
    const numbers = text.match(numberRegex);
    let convertedText = text;
    if (numbers) {
      numbers.forEach((number) => {
        const text = convertNumberToText(parseInt(number));
        convertedText = convertedText.replace(number, text);
      });
    }
    return convertedText;
  };

  const convertNumberToText = (number) => {
    const textArray = [
      'nula',
      'jeden',
      'dva',
      'tri',
      'štyri',
      'päť',
      'šesť',
      'sedem',
      'osem',
      'deväť',
      'desať',
      'jedenásť',
      'dvanásť',
      'trinásť',
      'štrnásť',
      'pätnásť',
      'šestnásť',
      'sedemnásť',
      'osemnásť',
      'devätnásť'
    ];

    const tensArray = [
      '',
      '',
      'dvadsať',
      'tridsať',
      'štyridsať',
      'päťdesiat',
      'šesťdesiat',
      'sedemdesiat',
      'osemdesiat',
      'deväťdesiat'
    ];

    if (number === 0) {
      return 'nula';
    }

    let text = '';

    if (number >= 1000000) {
      const milions = Math.floor(number / 1000000);
      text += convertNumberToText(milions) + 'milión';
      number %= 1000000;
    }

    if (number >= 1000) {
      const thousands = Math.floor(number / 1000);
      text += convertNumberToText(thousands) + 'tisíc';
      number %= 1000;
    }

    if (number >= 100) {
      const hundreds = Math.floor(number / 100);
      text += textArray[hundreds] + 'sto';
      number %= 100;
    }

    if (number >= 20) {
      const tens = Math.floor(number / 10);
      text += tensArray[tens] + '';
      number %= 10;
    }

    if (number > 0) {
      text += textArray[number];
    }

    return text.trim();
  };


  const combineTxt = (files) => {
    let combinedText = '';
    ChangeMessage();

    const fileReaderPromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const fileReader = new FileReader();

        fileReader.onload = (e) => {
          const fileContent = e.target.result;
          combinedText += file.name + ':\n' + fileContent + '\n\n';
          resolve();
        };

        fileReader.onerror = (e) => {
          reject(new Error('Unable to read file!'));
        };

        fileReader.readAsText(file);
      });
    });

    Promise.all(fileReaderPromises)
      .then(() => {
        
        setText(combinedText);
        setMessage('');
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const combinePdf = (files) => {

    let combinedText = '';
    ChangeMessage();

    const fileReaderPromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const fr = new FileReader();

        fr.onload = () => {
          const res = fr.result;
          const b64 = res.split('base64,')[1];
    
          fetch(apiFile, {
            method: 'POST',
            body: JSON.stringify({
              file: b64,
              type: file.type,
              name: file.name,
            }),
          })
            .then((res) => res.text())
            .then((data) => {
              const fileContent = data;
              combinedText += file.name + ':\n' + fileContent + '\n\n';
              resolve();
              
            });
        };

        fr.onerror = () => {
          reject(new Error('Unable to read file!'));
        };
    
        fr.readAsDataURL(file);

      });
    });    

    Promise.all(fileReaderPromises)
      .then(() => {
        setMessage('');
        setText(combinedText);
      })
      .catch((error) => {
        console.error(error);
      });

   
  };  

  const ChangeMessage = () => {
    if (message === ''){
      setMessage('Načítavanie textu...');
    }
    if (message === 'Načítavanie textu...'){
      setMessage('');
    }
  }

  const handleFileChange = (e) => {
    const fileList = e.target.files;
    const fileArray = Array.from(fileList);
    const filetest = e.target.files[0];
  
    if(filetest.type === 'text/plain'){
      combineTxt(fileArray);
    }

    if(filetest.type === 'application/pdf'){
      combinePdf(fileArray);
    }  

  };


  const handleInputChange = (event) => {
    setText(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      finalOutput = text.replace(/\s+/g, ' ').trim();
      setChecker('no');
      
      if(outputType5 === "stop"){
        finalOutput = removeStopWords(finalOutput);
      }


      if(outputType4 === "num2wrd"){     
        finalOutput = convertText(finalOutput);
      }

      if(outputType3 === "lemma"){
        const textWithWhitespace = finalOutput.replace(/\n/g, ' ');
        const morpho = "https://lindat.mff.cuni.cz/services/morphodita/api/tag?output=json&model=slovak-morfflex-pdt-170914&data=";
        const morphoText2 = morpho + textWithWhitespace;
        const response = await fetch(morphoText2);
        const data = await response.json();
        const lemmas = data.result.map(arr => arr.map(item => item.lemma.match(/^[^_-`]*/)[0]).join(' ')).join(' ');
   
        finalOutput = lemmas;
      }

      if(outputType2 === "upper" && outputType !== "textseg"){
        const uppercase = finalOutput.toUpperCase();
        finalOutput = uppercase;
      }

      if(outputType2 === "lower" && outputType !== "textseg"){
        const lowercase = finalOutput.toLowerCase();
        finalOutput = lowercase;   
      }

      if(outputType === "token" && outputType3 !== "lemma"){
        const textWithWhitespace = finalOutput.replace(/\n/g, ' ');
        const morpho = "https://lindat.mff.cuni.cz/services/morphodita/api/tag?output=json&model=slovak-morfflex-pdt-170914&data=";
        const morphoText2 = morpho + textWithWhitespace;
        const response = await fetch(morphoText2);
        const data = await response.json();
        const tokens = data.result.map(arr => arr.map(item => item.token).join(' ')).join(' ');
   
        finalOutput = tokens;
      }

      if(outputType === "textseg"){
        setChecker("yes");

        const regex = /[0123456789\u0041\u0042\u0043\u010C\u0044\u010E\u0045\u00C9\u0046\u0047\u0048\u0049\u00CD\u004A\u004B\u004C\u0139\u013D\u004D\u004E\u0147\u004F\u00D3\u00D4\u0050\u0051\u0052\u0154\u0053\u0160\u0054\u0164\u0055\u00DA\u0056\u0057\u0058\u0059\u00DD\u005A\u017D\u00C1\u00C4].*?(?:[.!?](?=\s+[0123456789\u0041\u0042\u0043\u010C\u0044\u010E\u0045\u00C9\u0046\u0047\u0048\u0049\u00CD\u004A\u004B\u004C\u0139\u013D\u004D\u004E\u0147\u004F\u00D3\u00D4\u0050\u0051\u0052\u0154\u0053\u0160\u0054\u0164\u0055\u00DA\u0056\u0057\u0058\u0059\u00DD\u005A\u017D\u00C1\u00C4])|$)/gm;
        const matches = finalOutput.match(regex);

        if(outputType2 ==="upper"){
          const matches2 = matches.map(word => word.toUpperCase());
          setSentences(matches2 ? matches2 : [text]);

        }else if(outputType2 ==="lower"){
          const matches2 = matches.map(word => word.toLowerCase());
          setSentences(matches2 ? matches2 : [text]);
        }else{
          setSentences(matches ? matches : [text]);
        }
        
      }

      if(outputType !== "textseg"){
        const test = finalOutput.split(' ')
        setTokenizedWords(test)

      }

    } catch (error) {
      console.error(error);
      
    }
  };

  const Change3 = () => {
    if (outputType3 === 'lemma'){
      setOutputType3('.');
    }
    else{
      setOutputType3('lemma');
    }
  }

  const Change4 = () => {
    if (outputType4 === 'num2wrd'){
      setOutputType4('.');
    }
    else{
      setOutputType4('num2wrd');
    }
  }

  const Change5 = () => {
    if (outputType5 === 'stop'){
      setOutputType5('.');
    }
    else{
      setOutputType5('stop');
    }
  }

  const handleDownload = () => {
    const csvData = Papa.unparse((tokenizedWords.map((token) => [token])));
    
    // const csvData = Papa.unparse(tokenizedWords.reduce((acc, token) => {
    //   if (token.endsWith('.pdf:')) {
    //     acc.push([token]);
    //   } else if (acc.length > 0) {
    //     acc[acc.length - 1][acc[acc.length - 1].length - 1] += `, ${token}`;
    //   } else {
    //     acc.push(['', token]);
    //   }
    //   return acc;
    // }, []));
    
    const csvBlob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const csvUrl = URL.createObjectURL(csvBlob);
    const link = document.createElement('a');
    link.href = csvUrl;
    link.setAttribute('download', 'output.csv');
    link.click();
    counting = counting+1;  
  };

  const handleDownloadTextseg  = () => {
    const csvData = sentences.map(token => `${token}\n`).join('');
    const csvBlob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const csvUrl = URL.createObjectURL(csvBlob);
    const link = document.createElement('a');
    link.href = csvUrl;
    link.setAttribute('download', 'output.csv');
    link.click();
  };


  return (
    <ChakraProvider>

      <Box width="100%" height="100%" bgGradient='linear(to-t, , #FFFFFF, #99276F ,#FFFFFF)'>

      <Box as="h2" fontSize="25px" justifyContent="space-evenly">
        <Center>
          <Text fontWeight='extrabold'> Normalizácia textu</Text>
        </Center>
      </Box>

      
      <form onSubmit={handleSubmit}>
          <Box p={4}>
            <Center>
              Vložte text alebo načítajte textový súbor a vyberte si úpravu textu:
            </Center>
            <Textarea type="text" placeholder="Input your text" resize="vertical" value={text} onChange={handleInputChange} />
            <Input type="file" className="file" accept=".pdf,.txt" size="sm" variant='unstyled' multiple onChange={handleFileChange} />
          </Box>

        <Box as="h2" fontSize="18px" justifyContent="space-evenly">
        <Center>
          <Text className="messg" as='i'> {message} </Text>
          </Center>
        </Box>

        <Center> <Box p={3}><Stack spacing={5} direction="row" align="center"> 
        <Select placeholder='Token/Text seg.' bg='cadetblue' value={outputType} onChange={(e) => setOutputType(e.target.value)}>    
          <option value='token'>Tokenizácia</option>
          <option>Tokenizácia medzerou</option>
          <option value='textseg'>Text Segmentation</option>

        </Select>
        <Select placeholder='Upper/Lower' bg='cadetblue' value={outputType2} onChange={(e) => setOutputType2(e.target.value)}>
          <option value='upper'>Upper case</option>
          <option value='lower'>Lower case</option>
        </Select>
        <Checkbox onChange={() => Change3()}>Lematizácia</Checkbox>
        <Checkbox onChange={() => Change4()}>Číslo slovom </Checkbox>
        <Checkbox onChange={() => Change5()}>Vymazanie stop slov</Checkbox>
        
        <Button type="submit" colorScheme="whatsapp" size="lg" border='2px' borderColor='black'>Submit</Button>
        </Stack></Box></Center>    
      </form>


      <Box p={4}>
        Upravený text:
        <Textarea type="text" resize="vertical" value={checker === 'yes' && sentences ? sentences.join('\n') : tokenizedWords ? tokenizedWords.join('\n') : ''}readOnly />
      </Box>

      
      <div>
      <Box p={6}>
        {checker === 'yes' && sentences[0] ? <Button type="button" colorScheme="whatsapp" onClick={() => handleDownloadTextseg (sentences)}>Stiahnuť súbor (.csv)</Button> :
        tokenizedWords[0] ? <Button type="button" colorScheme="whatsapp" onClick={() => handleDownload()}>Stiahnuť súbor (.csv)</Button> : ''}         
      </Box>
      </div>
         
    </Box>
    
    </ChakraProvider>
  );
}

export default Normalize;
