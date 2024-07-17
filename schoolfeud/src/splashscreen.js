import React, { useState } from "react";
import { Container, Input, Button } from "reactstrap";


export function SplashScreen({ onFileUpload, onStartGame, showEditor }) {
    const [message, setMessage] = useState("Upload a file to begin");
    const [buttonState, setButtonState] = useState(false);

    const onFileUploadOverride = (e) => {
        if (e.target.files.length === 0) {
            setMessage('No file selected');
            setButtonState(false);
            return;
        }
        setMessage('Press "Play Game" to start');
        setButtonState(true);
        onFileUpload(e);
    }


    return (
        <Container className="text-center" style={{ paddingTop: '20%' }}>
            <h1 style={{ fontSize: '2em', marginBottom: '20px' }}>Welcome to School Feud</h1>
            <Button onClick={showEditor} style={{ position: 'absolute', right: '10px', top: '10px' }}>
                Question Editor
            </Button>
            <Input type="file" onChange={onFileUploadOverride} style={{ marginBottom: '20px' }} accept=".csv" />
            <h2>{message}</h2>
            <Button color="success" size="lg" onClick={onStartGame} style={{ animation: 'pulse 1.5s infinite' }} disabled={!buttonState}>
                Play Game
            </Button>
        </Container>
    );
}