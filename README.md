# QSI Token Manager

[Live Demo](https://qsi-token-manager-fc9f810c10ad.herokuapp.com/)

**QSI Token Manager** is a robust solution for managing QSI tokens, offering features such as liquidity management, wallet operations, and webhook integrations. This project provides a reliable backend server to handle all operations related to QSI tokens.

---

## Table of Contents
- [Features](#features)
- [Live Demo](#live-demo)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Features

- **Liquidity Management:** Seamlessly add and withdraw liquidity.
- **Wallet Operations:** Efficiently manage token wallets.
- **Webhook Integration:** Receive real-time updates via webhooks.
- **Robust API:** Secure endpoints for various token operations.

---

## Live Demo

Experience the working server in action:  
[https://qsi-token-manager-fc9f810c10ad.herokuapp.com/](https://qsi-token-manager-fc9f810c10ad.herokuapp.com/)

---

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/qsi-team/qsi-token-manager.git
   cd qsi-token-manager
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   - Create a `.env` file in the root directory.
   - Set the required variables (refer to `.env.example` if available).

---

## Usage

1. **Start the server:**

   ```bash
   npm start
   ```

2. **For development (with auto-reload):**

   ```bash
   npm run dev
   ```

3. **Access the API locally:**

   Open your browser or API client at:  
   `http://localhost:3000`  
   *(Port may vary based on your configuration.)*

---

## API Endpoints

### General
- `GET /status` — Check server status.

### Liquidity Management
- `POST /addLiquidity` — Add liquidity to the pool.
- `POST /withdrawLiquidity` — Withdraw liquidity from the pool.

### Wallet Operations
- `GET /wallet/balance` — Retrieve the wallet balance.
- `POST /wallet/transfer` — Transfer tokens between wallets.

> **Note:** For detailed API documentation, refer to inline code comments or additional docs if available.

---

## Technologies Used

- **Node.js:** JavaScript runtime.
- **Express.js:** Web framework.
- **Heroku:** Deployment platform.
- **Additional Libraries:** See `package.json` for the full list of dependencies.

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch:  
   `git checkout -b feature/YourFeature`
3. Commit your changes:  
   `git commit -m 'Add YourFeature'`
4. Push your branch:  
   `git push origin feature/YourFeature`
5. Open a pull request.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact

For questions or suggestions, please contact:

**Stan Ataev**  
[GitHub](https://github.com/qsi-team)  
[Email](mailto:info@quickshooters.com)

