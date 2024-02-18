// Function to get the current date and time in the format DD/MM/YY HH:MM:SS
export const getCurrentDateTime = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear()).slice(-2);
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

// Function to log a message with the current date and time
export const log = (message) => {
  console.log(`[${getCurrentDateTime()}]: ${message} \n`);
};

export const handleCtrlC = () => {
  log("Ctrl-C detected. Exiting script...");
  console.log("-----------------------------------------------------");
  process.exit(0);
};

export const parseArgs = () => {
  const args = process.argv.slice(2); // Remove the first two elements (node and script file path)

  let chosenOption = "headless"; // Default to headless

  if (args.includes("--login")) {
    chosenOption = "login";
  }

  if (args.includes("--headless") && chosenOption === "login") {
    throw new Error(
      "Both --login and --headless options cannot be chosen together."
    );
  }

  return chosenOption;
};
