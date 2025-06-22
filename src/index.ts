const args = process.argv.slice(2);
const userName = args.join(" ") || "World";

console.log(`Hello, ${userName}!`);
