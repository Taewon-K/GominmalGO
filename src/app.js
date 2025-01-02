import axios from 'axios';

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
