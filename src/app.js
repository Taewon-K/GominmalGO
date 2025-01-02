import axios from 'axios';
import { initializeApp } from './hospital.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        initializeApp();
    } catch (error) {
        console.error('앱 초기화 중 오류 발생:', error);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const messageForm = document.getElementById('message-form');
    const userInput = document.getElementById('user-input');

    const counsel = function (message) {
        axios({
            method: 'post',
            url: `https://gominmalgo.fly.dev/assistant/`,
            data: {
                'message': message
            }
        })
        .then((response) => {
            console.log(response)
        })
        .catch((error) => {
            console.log(error)
            alert('오류가 발생했습니다. 다시 시도해주세요.')
        })
    }

    messageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const message = userInput.value;
        counsel(message);
        userInput.value = ''; // 입력 필드 초기화
    });
});
