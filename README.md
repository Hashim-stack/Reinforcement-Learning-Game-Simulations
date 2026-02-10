# 🧠 Reinforcement Learning Game Simulations 🎮⚽

Interactive projects that demonstrate **Reinforcement Learning (Q-Learning)** concepts using **Python** and **JavaScript**.

These projects focus on learning by visual feedback, where an AI agent improves its decisions over time based on rewards.

---
## 🚀 Projects Included

### Project 1
### ⚽ RL Penalty Shootout (Python – Streamlit)

An interactive football penalty shootout where:
- You choose the shot direction
- An AI goalkeeper learns using Q-Learning
- The goalkeeper adapts after every attempt

**Tech Stack**
- Python
- Streamlit
- NumPy
- Reinforcement Learning (Q-Learning)

**Concepts Covered**
- State–Action pairs  
- Reward & penalty system  
- Exploration vs exploitation  
- Q-table updates  

---
### Project 2
### 🎮 Neon Striker – RL Penalty Shootout (JavaScript)

A neon-themed browser-based game where:
- The player shoots left, center, or right
- The AI goalkeeper learns player behavior
- Q-values are updated and visualized in real time

**Tech Stack**
- HTML5 Canvas
- Vanilla JavaScript
- CSS (Neon UI)
- Reinforcement Learning (Q-Learning)

**Concepts Covered**
- Epsilon-greedy strategy  
- Learning rate & discount factor  
- Real-time Q-table visualization  

---

## 🧠 Reinforcement Learning Formula

Both projects use the Q-Learning update rule:

Q(s, a) ← Q(s, a) + α [ r + γ max Q(s', a') − Q(s, a) ]

Where:
- α = Learning rate  
- γ = Discount factor  
- r = Reward  

---

## 📁 Project Structure

```
reinforcement-learning-projects/
│
├── RL Using Python/
│   ├── app.py
│   └── assets/
│
├── RL Using Js/
│   ├── index.html
│   ├── style.css
│   └── scripts.js
│
└── README.md
```

---

## ▶️ How to Run

### 🐍 Python Project (Streamlit)

```
pip install streamlit numpy
streamlit run app.py
```

Then open:
```
http://localhost:8501
```

---

### 🌐 JavaScript Project

Simply open `index.html` in your browser.  
No server or build tools required.

---

## 🎯 Why This Repository?

- Clear demonstration of Reinforcement Learning concepts  
- Visual and interactive learning  
- Beginner-friendly implementations  
- Suitable for portfolios and academic projects  

---

## 🌱 Future Enhancements

- Persistent Q-table storage  
- Difficulty levels  
- Deep Q-Learning (DQN)  
- Advanced agent strategies  

---

## ⭐ Support

If you find this project useful, consider giving it a ⭐  
Fork it, explore it, and build on top of it!

Happy Learning 🚀🧠
