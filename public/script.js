const recordButton = document.getElementById('recordButton');
const audioPlayback = document.getElementById('audioPlayback');

// Fetch and display the most recent recording on page load
window.addEventListener('load', async () => {
    try {
        const response = await fetch('/api/recordings');
        const data = await response.json();
        const recordings = data.recordings;
        if (recordings.length > 0) {
            audioPlayback.src = recordings[recordings.length - 1];
        }
    } catch (error) {
        console.error('Error fetching recordings:', error);
    }
});

recordButton.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks = [];

        recorder.start();

        recorder.ondataavailable = event => {
            chunks.push(event.data);
        };

        recorder.onstop = async () => {
            const blob = new Blob(chunks, { type: 'audio/wav' });
            const audioURL = URL.createObjectURL(blob);

            audioPlayback.src = audioURL;

            await sendRecording(blob);
        };

        setTimeout(() => {
            recorder.stop();
            stream.getTracks().forEach(track => track.stop());
        }, 5000);
    } catch (error) {
        console.error('Error accessing microphone:', error);
    }
});

async function sendRecording(blob) {
    try {
        const formData = new FormData();
        formData.append('recording', blob, 'recording.wav');

        const response = await fetch('/api/recordings', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        console.log(data.message);

        // Update the audio playback source to the new recording
        audioPlayback.src = data.file;
    } catch (error) {
        console.error('Error sending recording to server:', error);
    }
}
