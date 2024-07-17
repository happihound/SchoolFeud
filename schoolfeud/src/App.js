import './App.css';
import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Table, Button } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Papa from 'papaparse';
import { Input } from 'reactstrap';
import { SplashScreen } from './splashscreen';
import { CSVEditor } from './editor';

function App() {
    const maxStrikes = 3;
    const [team1Strikes, setTeam1Strikes] = useState(0);
    const [team2Strikes, setTeam2Strikes] = useState(0);
    const [question, setQuestion] = useState('Please upload a game file to begin');
    const [questionIndex, setQuestionIndex] = useState(0);
    const [file, setFile] = useState(null);
    const [answers, setAnswers] = useState([
    ]); //placeholder answers
    const [answerValues, setAnswerValues] = useState([

    ]); //placeholder answer values
    const [team1AnswerIndeces, setTeam1AnswerIndeces] = useState([]);
    const [team2AnswerIndeces, setTeam2AnswerIndeces] = useState([]);
    const [currentTeam, setCurrentTeam] = useState(1);
    const [numberOfQuestions, setNumberOfQuestions] = useState(0);
    const [parsedResults, setParsedResults] = useState([]);
    const [popoutVisbility, setPopoutVisibility] = useState(false);
    const popoutWindow = useRef(null);

    const [showSplashScreen, setShowSplashScreen] = useState(true);
    const [showEditor, setShowEditor] = useState(false);




    const renderStrikes = (team) => {
        let renderStrikes = [];
        renderStrikes.push(
            <Button key={`-1 - ${team}`} onClick={() => {
                if (team === 0) {
                    if (team1Strikes > 0) {
                        setTeam1Strikes(team1Strikes - 1);
                    }
                }
                else {
                    if (team2Strikes > 0) {
                        setTeam2Strikes(team2Strikes - 1);
                    }
                }
            }}
                disabled={team === 0 ? team1Strikes === 0 : team2Strikes === 0}
            >
                -
            </Button>)
        for (let i = 0; i < maxStrikes; i++) {
            renderStrikes.push(
                <Button key={`${i} - ${team}`} style={{
                    backgroundColor: team === 0 ? team1Strikes > i ? 'red' : 'white' : team2Strikes > i ? 'red' : 'white', width: '100px', height: '100px'

                }} onClick={() => {

                }}>
                    <h1 style={{
                        fontSize: '3em', fontWeight: 'bold', visibility: team === 0 ? team1Strikes > i ? 'visible' : 'hidden' : team2Strikes > i ? 'visible' : 'hidden'
                    }}>
                        X
                    </h1>
                </Button>
            )
        }
        renderStrikes.push(
            <Button key={`+1 - ${team}`} onClick={() => {
                if (team === 0) {
                    if (team1Strikes < maxStrikes) {
                        setTeam1Strikes(team1Strikes + 1);
                    }
                }
                else {
                    if (team2Strikes < maxStrikes) {
                        setTeam2Strikes(team2Strikes + 1);
                    }
                }
            }}
                disabled={team === 0 ? team1Strikes === maxStrikes : team2Strikes === maxStrikes}
            >
                +
            </Button>)
        return renderStrikes;
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        Papa.parse(file, {
            header: false,
            complete: (results) => {
                results.data = results.data;
                const data = results.data[0];
                setQuestion(data[0]);
                const loadedAnswers = [];
                const loadedAnswerValues = [];
                for (let i = 1; i < data.length; i += 2) {
                    if (data[i] && data[i + 1]) {
                        loadedAnswers.push(data[i]);
                        loadedAnswerValues.push(parseInt(data[i + 1], 10));
                    }
                }
                setAnswers(loadedAnswers);
                setAnswerValues(loadedAnswerValues);
                setFile(file);
                setNumberOfQuestions(results.data.length);
                setParsedResults(results.data); // Store the parsed results
                setQuestionIndex(0);
                setTeam1AnswerIndeces([]);
                setTeam2AnswerIndeces([]);
                updateContent(0);
            },
        });
    };

    const loadQuestionByIndex = (index) => {
        console.log('loading question', index);
        if (index >= 0 && index < numberOfQuestions) {
            const data = parsedResults[index];
            setQuestion(data[0]);
            const loadedAnswers = [];
            const loadedAnswerValues = [];
            for (let i = 1; i < data.length; i += 2) {
                if (data[i] && data[i + 1]) {
                    loadedAnswers.push(data[i]);
                    loadedAnswerValues.push(parseInt(data[i + 1], 10));
                }
            }
            setAnswers(loadedAnswers);
            setAnswerValues(loadedAnswerValues);
            setQuestionIndex(index);
            setTeam1AnswerIndeces([]);
            setTeam2AnswerIndeces([]);
            updateContent(index);
        }
    };


    const popOutTeacherPanel = () => {
        setPopoutVisibility(true);
        if (popoutWindow.current && !popoutWindow.current.closed) {
            popoutWindow.current.focus();
            return;
        }
        //clear the current popout window
        popoutWindow.current = window.open("", "Teacher Panel", "width=600,height=400");
        if (!popoutWindow.current) {
            alert('Please enable popups for this site');
            return;
        }
        popoutWindow.current.document.write(`
        <html>
            <head>
                <title>Teacher Panel</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; position: relative; }
                    h2 { font-size: 24px; }
                    ul { list-style-type: none; padding: 0; }
                    li { margin: 5px 0; }
                    button { padding: 10px; font-size: 16px; }
                    #content.blur { filter: blur(10px); }
                    .overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-color: rgba(0, 0, 0, 0.5);
                        color: white;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 24px;
                        z-index: 10;
                    }
                </style>
            </head>
            <body>
                <div id="content" class="blur">
                </div>
                <div id="overlay" class="overlay" onclick="document.getElementById('content').classList.remove('blur'); document.getElementById('overlay').style.display='none';"> 
                Click to unblur
                </div>
                <button onclick="window.close()">Close</button>

            </body>
        </html>
    `);

        const content = popoutWindow.current.document.getElementById('content');
        const questionElement = popoutWindow.current.document.createElement('h2');
        questionElement.textContent = question;
        content.appendChild(questionElement);

        const listElement = popoutWindow.current.document.createElement('ul');
        answers.forEach((answer, index) => {
            const listItem = popoutWindow.current.document.createElement('li');
            listItem.textContent = `${answer}: ${answerValues[index]} points`;
            listElement.appendChild(listItem);
        });
        content.appendChild(listElement);
        popoutWindow.current.onbeforeunload = () => {
            setPopoutVisibility(false);
        };
    };

    const updateContent = (index) => {
        if (!popoutWindow.current || popoutWindow.current.closed) {
            return;
        }
        const data = parsedResults[index];
        console.log('updating content', index, data);
        if (data) {
            const questionElement = popoutWindow.current.document.createElement('h2');
            questionElement.textContent = index + 1 + '. ' + data[0];
            const content = popoutWindow.current.document.getElementById('content');
            content.innerHTML = ''; // Clear previous content
            content.appendChild(questionElement);

            const listElement = popoutWindow.current.document.createElement('ul');
            for (let i = 1; i < data.length; i += 2) {
                if (data[i] && data[i + 1]) {
                    const listItem = popoutWindow.current.document.createElement('li');
                    listItem.textContent = `${data[i]}: ${parseInt(data[i + 1], 10)} points`;
                    listElement.appendChild(listItem);
                }
            }
            content.appendChild(listElement);
            //append the question index to the content so we can use it later
        }
    };

    const selectAnswer = (team, answerIndex) => {
        if (team === 1) {
            setTeam1AnswerIndeces([...team1AnswerIndeces, answerIndex])
            setCurrentTeam(0)
        }
        else {
            setTeam2AnswerIndeces([...team2AnswerIndeces, answerIndex])
            setCurrentTeam(1)
        }
    }

    const deselectAnswer = (answerIndex) => {
        setTeam1AnswerIndeces(team1AnswerIndeces.filter(index => index !== answerIndex))
        setTeam2AnswerIndeces(team2AnswerIndeces.filter(index => index !== answerIndex))
    }

    const renderTeams = () => {
        return (<Row className="justify-content-between align-items-center mt-4" xs="2">
            <Col className="text-center" style={{ backgroundColor: currentTeam === 1 ? 'lightblue' : 'white' }} onClick={() => setCurrentTeam(1)}>
                <h2>Team 1: <br />{team1AnswerIndeces.reduce((acc, index) => acc + answerValues[index], 0)} Points</h2>
                {renderStrikes(0)}
            </Col>
            <Col className="text-center" style={{ backgroundColor: currentTeam === 0 ? 'lightblue' : 'white' }} onClick={() => setCurrentTeam(0)}>
                <h2>Team 2:<br />
                    {team2AnswerIndeces.reduce((acc, index) => acc + answerValues[index], 0)} Points</h2>
                {renderStrikes(1)}
            </Col>
        </Row>)
    }


    const renderAnswerCell = (i) => {
        if (!team1AnswerIndeces.concat(team2AnswerIndeces).includes(i)) {
            return (
                <td style={{ width: '48%', visibility: i > answers.length ? 'hidden' : 'visible' }}>
                    <p className='text-center' max-width='40%'>
                        <Button onClick={() => selectAnswer(currentTeam, i)}>
                            Reveal
                        </Button>
                    </p>
                </td>
            )
        }
        else
            return (
                <td style={{ width: '48%', visibility: i > answers.length ? 'hidden' : 'visible' }}>
                    <p className='text-center' max-width='40%' style={{
                        fontSize: '1.5em', fontWeight: 'bold'
                    }}>
                        {answers[i]} <br /> Worth: {answerValues[i]} points<br />
                        <Button onClick={() => deselectAnswer(i)}>
                            Hide
                        </Button></p>
                </td>
            )
    }


    const renderGame = () => {
        return (
            <Container xs="12" className="text-center" style={{ marginLeft: '0px', marginRight: '0px', maxWidth: '100%' }}>
                <Button onClick={popOutTeacherPanel} style={{ position: 'absolute', right: '10px', top: '10px' }} disabled={popoutVisbility}>
                    Teacher Panel
                </Button>
                <Row className="justify-content-center" style={{ margin: 'auto' }}>
                    <h1 className="mt-4"><strong>School Feud</strong></h1>
                </Row>
                <Row className="justify-content-center">
                    <Col xs="auto">
                        <Button onClick={() => loadQuestionByIndex(questionIndex - 1)} disabled={questionIndex === 0}>Previous Question</Button>
                    </Col>
                    <Col xs="auto">
                        <Button onClick={() => loadQuestionByIndex(questionIndex + 1)} disabled={questionIndex === numberOfQuestions - 1}>Next Question</Button>
                    </Col>
                </Row>
                {renderTeams()}
                <Row>
                    <Col className="text-center mt-4" xs="auto" style={{ margin: 'auto' }}>
                        <h1 style={{ fontSize: '2em', fontWeight: 'bold', textWrap: 'pretty', maxWidth: '90%', margin: 'auto' }}>
                            Question: <br />
                            {question}
                        </h1>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Table bordered={true} className="mt-4" size="sm" style={{ overflowX: 'hidden' }}>
                            <tbody>
                                {[...Array(Math.floor(answers.length / 2) + answers.length % 2)].map((_, i) => (
                                    <tr key={i}>
                                        <td style={{ width: '2%', fontSize: '1.5em', fontWeight: 'bold', visibility: i * 2 > answers.length ? 'hidden' : 'visible' }}>
                                            {i * 2 + 1}
                                        </td>
                                        {renderAnswerCell(i * 2)}
                                        <td style={{ width: '2%', fontSize: '1.5em', fontWeight: 'bold', visibility: i * 2 + 1 > answers.length ? 'hidden' : 'visible' }}>
                                            {i * 2 + 2}
                                        </td>
                                        {renderAnswerCell(i * 2 + 1)}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Container >
        )
    }

    const showEditorOverride = () => {
        setShowEditor(true);
        setShowSplashScreen(false);
    }

    return (
        <span>
            {showEditor && (
                <CSVEditor />
            )}
            {showSplashScreen && (
                <span style={{ overflow: "hidden" }}>

                    <SplashScreen
                        onFileUpload={(results) => {
                            handleFileUpload(results);
                        }}
                        onStartGame={() => setShowSplashScreen(false)}
                        showEditor={() => showEditorOverride()}
                    />
                </span>
            )}
            {showSplashScreen || showEditor ? null :
                renderGame()
            }
        </span>
    );
}

export default App;
