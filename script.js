// 1. Xử lý Đếm ngược (Countdown)
const weddingDate = new Date("Feb 24, 2026 11:00:00").getTime();

const timer = setInterval(function() {
    const now = new Date().getTime();
    const distance = weddingDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").innerText = days;
    document.getElementById("hours").innerText = hours;
    document.getElementById("minutes").innerText = minutes;
    document.getElementById("seconds").innerText = seconds;

    if (distance < 0) {
        clearInterval(timer);
        document.querySelector(".timer").innerHTML = "Đám cưới đã diễn ra!";
    }
}, 1000);

// 2. Xử lý Nhạc nền (Music Toggle)
const musicBtn = document.getElementById('music-btn');
const audio = document.getElementById('bg-music');
let isPlaying = false;

function setMusicPlaying(playing) {
    const icon = musicBtn.querySelector('i');
    icon.style.opacity = '0';
    setTimeout(() => {
        if (playing) {
            icon.className = 'fas fa-music';
            musicBtn.classList.add('playing');
        } else {
            icon.className = 'fas fa-play';
            musicBtn.classList.remove('playing');
        }
        icon.style.opacity = '1';
    }, 200);
}

musicBtn.addEventListener('click', () => {
    if (isPlaying) {
        audio.pause();
        setMusicPlaying(false);
    } else {
        audio.play();
        setMusicPlaying(true);
    }
    isPlaying = !isPlaying;
});

// Try to autoplay (muted) on load and unmute on first user interaction.
document.addEventListener('DOMContentLoaded', () => {
    const soundPrompt = document.getElementById('sound-prompt');
    const welcomeBtn = document.querySelector('.welcome-btn');
    
    // Set volume to 50%
    audio.volume = 0.3;
    
    // Ensure audio is muted so browsers allow autoplay
    audio.muted = true;
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            // Autoplay (muted) succeeded - show welcome button for user to unmute
            isPlaying = true;
            
            // When user clicks the welcome button, unmute and start music
            welcomeBtn.onclick = () => {
                audio.muted = false;
                setMusicPlaying(true);
                soundPrompt.style.display = 'none';
            };
        }).catch((err) => {
            // Autoplay failed - clicking button will start playback
            console.log('Autoplay blocked:', err);
            welcomeBtn.onclick = () => {
                audio.muted = false;
                audio.play().then(() => {
                    isPlaying = true;
                    setMusicPlaying(true);
                    soundPrompt.style.display = 'none';
                });
            };
        });
    }
});

window.onclick = (event) => {
    if (event.target == mapModal) mapModal.style.display = "none";
}

// 4. Xử lý Popup Bản đồ
const mapBtn = document.getElementById('map-btn');
const mapModal = document.getElementById('map-modal');
const mapCloseBtn = document.querySelector('.map-close');

mapBtn.onclick = (e) => {
    e.preventDefault();
    mapModal.style.display = "block";
};
mapCloseBtn.onclick = () => mapModal.style.display = "none";

// 5. Mark today's date in calendar
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth(); // 0-11 (0 = January, 1 = February)
    const currentYear = today.getFullYear();
    
    // Check if calendar is showing current month (February = 1)
    const calendarMonth = 1; // February 2026
    const calendarYear = 2026;
    
    if (currentMonth === calendarMonth && currentYear === calendarYear) {
        // Find all calendar days
        const calendarDays = document.querySelectorAll('.calendar-day:not(.empty)');
        calendarDays.forEach((dayElement) => {
            const dayText = dayElement.textContent.trim();
            const dayNumber = parseInt(dayText);
            
            if (dayNumber === currentDay && !dayElement.classList.contains('wedding-day')) {
                dayElement.classList.add('today');
            }
        });
    }
});

// 6. RSVP Form — Submit to Google Sheets
// ⚠️ Replace this URL with your deployed Google Apps Script Web App URL
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwFG77OVRw4w5fH4TsvxbCdO6dJ2N_2EEhqtKxTtPlJY7LwX7AinXde1YP_CoCwiDMt/exec';

document.addEventListener('DOMContentLoaded', () => {
    const rsvpForm = document.getElementById('rsvp-form');
    const rsvpSuccess = document.getElementById('rsvp-success');
    const guestCountGroup = document.getElementById('guest-count-group');
    const submitBtn = rsvpForm.querySelector('.rsvp-submit-btn');
    const attendanceRadios = document.querySelectorAll('input[name="attendance"]');

    // Show/hide guest count based on attendance
    attendanceRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'no') {
                guestCountGroup.style.display = 'none';
            } else {
                guestCountGroup.style.display = 'block';
            }
        });
    });

    rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('rsvp-name').value;
        const attendance = document.querySelector('input[name="attendance"]:checked')?.value;
        const relation = document.getElementById('rsvp-relation').value;
        const guests = document.getElementById('rsvp-guests').value;
        const message = document.getElementById('rsvp-message').value;

        // Disable button while sending
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';

        // Prepare form data
        const formData = new FormData();
        formData.append('name', name);
        formData.append('attendance', attendance === 'yes' ? 'Có' : 'Không');
        formData.append('relation', relation);
        formData.append('guests', attendance === 'yes' ? guests : '0');
        formData.append('message', message);

        // Send to Google Sheets via Apps Script
        fetch(GOOGLE_SHEET_URL, {
            method: 'POST',
            body: formData,
        })
        .then(res => res.json())
        .then(data => {
            if (data.result === 'success') {
                rsvpForm.style.display = 'none';
                rsvpSuccess.style.display = 'block';
            } else {
                throw new Error(data.error || 'Unknown error');
            }
        })
        .catch(err => {
            console.error('RSVP error:', err);
            alert('Có lỗi xảy ra, vui lòng thử lại!');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi xác nhận';
        });
    });
});