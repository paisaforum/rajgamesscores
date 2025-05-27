import { generateHash } from './utils.js';

// Attach global handler (used by snake.js)
window.handleRedeem = async function (name, score) {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.style = `
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  `;

  // Create form UI
  const form = document.createElement('div');
  form.style = `
    background: #111;
    color: white;
    padding: 20px;
    border-radius: 10px;
    width: 300px;
    font-family: sans-serif;
    text-align: center;
    position: relative;
  `;

  form.innerHTML = `
    <h3>🎁 Redeem Your Score</h3>
    <p><strong>Score:</strong> ${score}</p>
    <label for="userIdInput">Your Raja Games User ID</label><br/>
    <input id="userIdInput" type="text" style="width: 90%; padding: 13px; margin-top: 8px; border-radius: 10px; border: none;" />
    <div id="formMessage" style="margin-top: 8px; min-height: 20px;"></div><br/>
    <button id="registerBtn" style="padding: 15px; border: none; border-radius: 8px; background: linear-gradient(45deg, #2a38f1, #b70aff); color: white; width: 138.5px; margin-right: 10px; font-size: 16px;">Register</button>
    <button id="submitBtn" style="padding: 15px; border: none; border-radius: 8px; background: linear-gradient(45deg, #2a38f1, #b70aff); color: white; width: 138.5px; font-size: 16px;">Submit</button>
    <br/><br/>
    <button id="cancelBtn" style="background: none; color: #ff6262; border: none;">Cancel</button>
  `;

  overlay.appendChild(form);
  document.body.appendChild(overlay);

  const formMessage = form.querySelector('#formMessage');
  const submitBtn = form.querySelector('#submitBtn');

  const showMessage = (text, color = 'red') => {
    formMessage.textContent = text;
    formMessage.style.color = color;
  };

  // Cancel
  form.querySelector('#cancelBtn').onclick = () => {
    document.body.removeChild(overlay);
  };

  // Register
  form.querySelector('#registerBtn').onclick = () => {
    window.open('https://www.rajagames8.com/#/register?invitationCode=48335807956', '_blank');
  };

  // Submit
  submitBtn.onclick = async () => {
    const userId = form.querySelector('#userIdInput').value.trim();
    if (!userId) {
      showMessage('Please enter your Raja Games User ID.');
      return;
    }

    submitBtn.disabled = true;

    try {
      const hash = await generateHash(name, score);
      const response = await fetch('https://7d478868-b979-4bbd-a852-e6cfc02ab3ff-00-2m4seg7ci4agz.sisko.replit.dev/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, score, userId, hash })
      });

      const result = await response.json();

      if (response.ok) {
        showMessage(result.status || 'Submitted successfully!', 'limegreen');

        setTimeout(() => {
          document.body.removeChild(overlay);

          const popup = document.getElementById('popup');
          if (popup) popup.classList.add('hidden');

          const startBtn = document.getElementById('startGame');
          const controls = document.getElementById('controls');
          const countdown = document.getElementById('countdown');

          if (startBtn) startBtn.classList.remove('hidden');
          if (controls) controls.classList.add('hidden');
          if (countdown) countdown.classList.add('hidden');

          if (window.resetTotalScore) {
            window.resetTotalScore(); // Reset score and UI
          }
        }, 1500);
      } else {
        showMessage(result.error || 'Something went wrong!');
      }
    } catch (err) {
      console.error(err);
      showMessage('Failed to submit. Please try again.');
    } finally {
      submitBtn.disabled = false;
    }
  };
};
