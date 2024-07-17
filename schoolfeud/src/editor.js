import './App.css';
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Input, Form, FormGroup, Label } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Papa from 'papaparse';

export function CSVEditor({ closeEditor }) {
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [currentAnswers, setCurrentAnswers] = useState(Array(8).fill(""));
    const [currentAnswerValues, setCurrentAnswerValues] = useState(Array(8).fill(""));

    useEffect(() => {
        const savedQuestions = JSON.parse(localStorage.getItem("questions"));
        if (savedQuestions) {
            setQuestions(savedQuestions);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("questions", JSON.stringify(questions));
    }, [questions]);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        Papa.parse(file, {
            header: false,
            complete: (results) => {
                const parsedQuestions = results.data.map(row => ({
                    question: row[0],
                    answers: row.slice(1, 17).filter((_, i) => i % 2 === 0),
                    answerValues: row.slice(1, 17).filter((_, i) => i % 2 === 1)
                }));
                setQuestions(parsedQuestions);
            },
        });
    };

    const addQuestion = () => {
        setQuestions([...questions, {
            question: currentQuestion,
            answers: currentAnswers,
            answerValues: currentAnswerValues
        }]);
        clearCurrentInputs();
    };

    const deleteQuestion = (index) => {
        const updatedQuestions = questions.filter((_, i) => i !== index);
        setQuestions(updatedQuestions);
    };

    const clearCurrentInputs = () => {
        setCurrentQuestion("");
        setCurrentAnswers(Array(8).fill(""));
        setCurrentAnswerValues(Array(8).fill(""));
    };

    const editQuestion = (index) => {
        const questionToEdit = questions[index];
        setCurrentQuestion(questionToEdit.question);
        setCurrentAnswers(questionToEdit.answers);
        setCurrentAnswerValues(questionToEdit.answerValues);
    };

    const downloadCSV = () => {
        const csvData = questions.map(q => [
            q.question,
            ...q.answers.flatMap((answer, i) => [answer, q.answerValues[i]])
        ]);
        const csvString = Papa.unparse(csvData);
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "questions.csv";
        link.click();
    };

    return (
        <Container>
            <Button color="danger" onClick={closeEditor}>Close Editor</Button>
            <Row>
                <Col>
                    <h1>CSV Question Editor</h1>
                    <Input type="file" onChange={handleFileUpload} />
                    <Form>
                        <FormGroup>
                            <Label for="question">Question</Label>
                            <Input
                                type="text"
                                id="question"
                                value={currentQuestion}
                                onChange={e => setCurrentQuestion(e.target.value)}
                            />
                        </FormGroup>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Row key={i}>
                                <Col>
                                    <FormGroup>
                                        <Label for={`answer${i}`}>Answer {i + 1}</Label>
                                        <Input
                                            type="text"
                                            id={`answer${i}`}
                                            value={currentAnswers[i]}
                                            onChange={e => {
                                                const newAnswers = [...currentAnswers];
                                                newAnswers[i] = e.target.value;
                                                setCurrentAnswers(newAnswers);
                                            }}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col>
                                    <FormGroup>
                                        <Label for={`answerValue${i}`}>Answer Value {i + 1}</Label>
                                        <Input
                                            type="number"
                                            id={`answerValue${i}`}
                                            value={currentAnswerValues[i]}
                                            onChange={e => {
                                                const newValues = [...currentAnswerValues];
                                                newValues[i] = e.target.value;
                                                setCurrentAnswerValues(newValues);
                                            }}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                        ))}
                        <Button color="primary" onClick={addQuestion}>Add Question</Button>
                    </Form>
                    <Button color="success" onClick={downloadCSV} className="mt-3">Download CSV</Button>
                </Col>
                <Col>
                    <h2>Questions</h2>
                    <Table>
                        <thead>
                            <tr>
                                <th>Question</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {questions.map((q, i) => (
                                <tr key={i}>
                                    <td>{q.question}</td>
                                    <td>
                                        <Button color="warning" onClick={() => editQuestion(i)}>Edit</Button>
                                        <Button color="danger" onClick={() => deleteQuestion(i)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    );
}

export default CSVEditor;
