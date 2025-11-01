# Scotland Yard - Online Multiplayer Game

A simple, browser-based multiplayer implementation of the classic Scotland Yard board game. Play with friends over the internet - one player is Mister X trying to evade 1-5 detectives on the London transit map.

## Features

- 🎮 Real-time multiplayer (2-6 players)
- 🔒 Private game rooms with simple join codes
- 🗺️ Interactive London transit map
- 🎯 Full Scotland Yard rules implementation
- 📱 Mobile-responsive design
- 🚀 No installation required - play in browser

## Tech Stack

- **Frontend**: React + Socket.IO Client + SVG
- **Backend**: Node.js + Express + Socket.IO
- **Game Framework**: boardgame.io
- **Hosting**: Railway (backend) + Vercel (frontend)

## Project Status

🚧 **In Development** - See [Issues](../../issues) for current work and roadmap.

## Quick Start

```bash
# Coming soon - project setup instructions
npm install
npm run dev
```

## Game Rules

Scotland Yard is a chase game where:
- One player is **Mister X** (hidden, trying to escape)
- Other players are **Detectives** (trying to catch Mister X)
- Players move using tickets (Taxi, Bus, Underground)
- Mister X is revealed only on specific rounds (3, 8, 13, 18, 24)
- Detectives win if they land on Mister X's position
- Mister X wins if detectives can't move or after 24 rounds

See [RULES.md](RULES.md) (coming soon) for complete rules.

## Contributing

This is a hobby project. Contributions welcome! See [Issues](../../issues) for planned features and bugs.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Original game by Ravensburger
- Inspired by the classic board game Scotland Yard
