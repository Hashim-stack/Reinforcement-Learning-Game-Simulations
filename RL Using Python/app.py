import streamlit as st
import numpy as np
import random
import base64
import time

def img_to_base64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()

pitch = img_to_base64("assets/pitch.png")
keeper = img_to_base64("assets/goalkeeper.png")
ball = img_to_base64("assets/ball.png")

st.set_page_config(page_title="⚽ RL Penalty Shootout", layout="wide")

st.markdown("""
<style>
/* ---------- Stadium ---------- */
body {
    background: radial-gradient(circle at top, #0f2027, #000);
}

/* ---------- FIXED HUD ---------- */
.hud {
    position: fixed;
    top: 70px;
    left: 70%;
    transform: translateX(-50%);
    width: 50%;
    max-width: 900px;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(6px);
    border-radius: 14px;
    padding: 12px 24px;
    z-index: 999;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 10px 30px rgba(0,0,0,0.6);
}

.hud h2 {
    margin: 0;
}

/* Result glow */
.result-goal {
    color: #00ff88;
    text-shadow: 0 0 15px #00ff88;
}
.result-save {
    color: #ff4d4d;
    text-shadow: 0 0 15px #ff4d4d;
}

/* ---------- Field ---------- */
.field {
    position: relative;
    width: 600px;
    height: 360px;
    margin: 120px auto 0;
    perspective: 800px;
}

/* ---------- Goal ---------- */
.goal {
    position: absolute;
    top: 0;
    left: 0;
    width: 600px;
    filter: drop-shadow(0 10px 20px rgba(0,0,0,0.6));
}

/* ---------- GK ---------- */
.keeper {
    position: absolute;
    top: 110px;
    width: 180px;
    animation: idle 1.4s ease-in-out infinite;
    transition: left 0.22s ease, transform 0.22s ease;
    filter: drop-shadow(0 12px 14px rgba(0,0,0,0.6));
}

@keyframes idle {
    0% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-6px) scale(1.02); }
    100% { transform: translateY(0) scale(1); }
}

.keeper.left { transform: translateX(-35px) rotate(-12deg) scale(1.05); }
.keeper.right { transform: translateX(35px) rotate(12deg) scale(1.05); }
.keeper.center { transform: translateX(0); }

/* ---------- Ball ---------- */
.ball {
    position: absolute;
    top: 175px;
    width: 70px;
    transition: all 0.35s cubic-bezier(.4,1.4,.6,1);
    filter: drop-shadow(0 8px 10px rgba(0,0,0,0.7));
}

.ball.left { transform: scale(0.9) rotate(-20deg); }
.ball.right { transform: scale(0.9) rotate(20deg); }
.ball.center { transform: scale(1.05); }

/* ---------- Positions ---------- */
.left { left: 75px; }
.center { left: 270px; }
.right { left: 470px; }
</style>
""", unsafe_allow_html=True)

st.title("⚽ RL – Penalty Shootout")
st.caption("You shoot - AI goalkeeper learns")

directions = ["Left", "Center", "Right"]
q_table = np.zeros((3, 3))
alpha, gamma, epsilon = 0.3, 0.9, 0.2

for key, val in {
    "shots": 0,
    "score": 0,
    "keeper_pos": "Center",
    "ball_pos": "Center",
    "result": ""
}.items():
    if key not in st.session_state:
        st.session_state[key] = val

result_class = ""
if "GOOOOAL" in st.session_state.result:
    result_class = "result-goal"
elif "SAVED" in st.session_state.result:
    result_class = "result-save"

st.markdown(f"""
<div class="hud">
    <h2 class="{result_class}">{st.session_state.result}</h2>
    <h3>⚽ Attempts {st.session_state.shots} &nbsp; | &nbsp; 🏆 Score {st.session_state.score}</h3>
</div>
""", unsafe_allow_html=True)

left, right = st.columns([1, 2])

with left:
    st.subheader("🎯 Take the Penalty")
    shot_dir = st.radio("Shot Direction", directions)
    shoot = st.button("🥅 SHOOT!", type="primary")



# ---------- Game logic ----------
if shoot:
    time.sleep(0.15)

    d = directions.index(shot_dir)

    if random.random() < epsilon:
        keeper_action = random.randint(0, 2)
    else:
        row = q_table[d]
        max_q = np.max(row)
        best_actions = np.where(row == max_q)[0]
        keeper_action = random.choice(best_actions)
    st.session_state.ball_pos = shot_dir
    st.session_state.keeper_pos = directions[keeper_action]

    reward = -1 if keeper_action == d else 1
    st.session_state.result = "🧤 SAVED!" if reward == -1 else "⚽ GOOOOAL!"

    q_table[d, keeper_action] += alpha * (
        reward + gamma * np.max(q_table[d]) - q_table[d, keeper_action]
    )

    st.session_state.score += reward
    st.session_state.shots += 1

    st.rerun()
with right:
    kp = st.session_state.keeper_pos.lower()
    bp = st.session_state.ball_pos.lower()

    st.markdown(f"""
    <div class="field">
        <img class="goal" src="data:image/png;base64,{pitch}">
        <img class="keeper {kp}" src="data:image/png;base64,{keeper}">
        <img class="ball {bp}" src="data:image/png;base64,{ball}">
    </div>
    """, unsafe_allow_html=True)

st.caption("Goalkeeper improves using Reinforcement Learning after every penalty.")