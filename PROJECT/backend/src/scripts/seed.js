import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { Question, hashAnswer } from '../models/Question.js';
import { config } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);

const questionsByDifficulty = {
  1: [
    { prompt: 'What is 2 + 2?', choices: [{ id: 'a', text: '3' }, { id: 'b', text: '4' }, { id: 'c', text: '5' }], correctId: 'b' },
    { prompt: 'Which planet is closest to the Sun?', choices: [{ id: 'a', text: 'Venus' }, { id: 'b', text: 'Mercury' }, { id: 'c', text: 'Earth' }], correctId: 'b' },
    { prompt: 'How many days are in a week?', choices: [{ id: 'a', text: '5' }, { id: 'b', text: '6' }, { id: 'c', text: '7' }], correctId: 'c' },
    { prompt: 'What color is the sky on a clear day?', choices: [{ id: 'a', text: 'Green' }, { id: 'b', text: 'Blue' }, { id: 'c', text: 'Red' }], correctId: 'b' },
    { prompt: 'Which animal says "moo"?', choices: [{ id: 'a', text: 'Dog' }, { id: 'b', text: 'Cow' }, { id: 'c', text: 'Cat' }], correctId: 'b' },
  ],
  2: [
    { prompt: 'What is 7 × 8?', choices: [{ id: 'a', text: '54' }, { id: 'b', text: '56' }, { id: 'c', text: '58' }], correctId: 'b' },
    { prompt: 'Which continent is the largest?', choices: [{ id: 'a', text: 'Africa' }, { id: 'b', text: 'Asia' }, { id: 'c', text: 'Europe' }], correctId: 'b' },
    { prompt: 'How many sides does a hexagon have?', choices: [{ id: 'a', text: '5' }, { id: 'b', text: '6' }, { id: 'c', text: '7' }], correctId: 'b' },
    { prompt: 'What is the capital of France?', choices: [{ id: 'a', text: 'Lyon' }, { id: 'b', text: 'Paris' }, { id: 'c', text: 'Marseille' }], correctId: 'b' },
    { prompt: 'Which gas do plants absorb from the air?', choices: [{ id: 'a', text: 'Oxygen' }, { id: 'b', text: 'Carbon dioxide' }, { id: 'c', text: 'Nitrogen' }], correctId: 'b' },
  ],
  3: [
    { prompt: 'What is 15% of 200?', choices: [{ id: 'a', text: '25' }, { id: 'b', text: '30' }, { id: 'c', text: '35' }], correctId: 'b' },
    { prompt: 'Who wrote "Romeo and Juliet"?', choices: [{ id: 'a', text: 'Dickens' }, { id: 'b', text: 'Shakespeare' }, { id: 'c', text: 'Austen' }], correctId: 'b' },
    { prompt: 'What is the chemical symbol for gold?', choices: [{ id: 'a', text: 'Go' }, { id: 'b', text: 'Au' }, { id: 'c', text: 'Gd' }], correctId: 'b' },
    { prompt: 'In which year did World War II end?', choices: [{ id: 'a', text: '1943' }, { id: 'b', text: '1945' }, { id: 'c', text: '1947' }], correctId: 'b' },
    { prompt: 'What is the square root of 144?', choices: [{ id: 'a', text: '10' }, { id: 'b', text: '12' }, { id: 'c', text: '14' }], correctId: 'b' },
  ],
  4: [
    { prompt: 'Solve: 2x + 5 = 15', choices: [{ id: 'a', text: 'x = 4' }, { id: 'b', text: 'x = 5' }, { id: 'c', text: 'x = 6' }], correctId: 'b' },
    { prompt: 'Which planet has the most moons?', choices: [{ id: 'a', text: 'Jupiter' }, { id: 'b', text: 'Saturn' }, { id: 'c', text: 'Uranus' }], correctId: 'b' },
    { prompt: 'What is the speed of light (approx.) in km/s?', choices: [{ id: 'a', text: '200,000' }, { id: 'b', text: '300,000' }, { id: 'c', text: '400,000' }], correctId: 'b' },
    { prompt: 'Who developed the theory of relativity?', choices: [{ id: 'a', text: 'Newton' }, { id: 'b', text: 'Einstein' }, { id: 'c', text: 'Bohr' }], correctId: 'b' },
    { prompt: 'What is the atomic number of carbon?', choices: [{ id: 'a', text: '4' }, { id: 'b', text: '6' }, { id: 'c', text: '8' }], correctId: 'b' },
  ],
  5: [
    { prompt: 'What is ∫ x dx?', choices: [{ id: 'a', text: 'x²' }, { id: 'b', text: 'x²/2' }, { id: 'c', text: '2x' }], correctId: 'b' },
    { prompt: 'Which programming language is known for the web?', choices: [{ id: 'a', text: 'Java' }, { id: 'b', text: 'JavaScript' }, { id: 'c', text: 'C++' }], correctId: 'b' },
    { prompt: 'What does HTTP stand for?', choices: [{ id: 'a', text: 'Hyper Text Transfer Protocol' }, { id: 'b', text: 'High Transfer Text Protocol' }, { id: 'c', text: 'Hyper Transfer Text Protocol' }], correctId: 'a' },
    { prompt: 'In binary, what is 8 + 4?', choices: [{ id: 'a', text: '1100' }, { id: 'b', text: '1010' }, { id: 'c', text: '1110' }], correctId: 'a' },
    { prompt: 'What is the time complexity of binary search?', choices: [{ id: 'a', text: 'O(n)' }, { id: 'b', text: 'O(log n)' }, { id: 'c', text: 'O(n²)' }], correctId: 'b' },
  ],
  6: [
    { prompt: 'What is a REST API?', choices: [{ id: 'a', text: 'A type of database' }, { id: 'b', text: 'An architectural style for APIs' }, { id: 'c', text: 'A programming language' }], correctId: 'b' },
    { prompt: 'Which data structure is LIFO?', choices: [{ id: 'a', text: 'Queue' }, { id: 'b', text: 'Stack' }, { id: 'c', text: 'Array' }], correctId: 'b' },
    { prompt: 'What does SQL stand for?', choices: [{ id: 'a', text: 'Structured Query Language' }, { id: 'b', text: 'Simple Query Language' }, { id: 'c', text: 'Standard Query Logic' }], correctId: 'a' },
    { prompt: 'What is Docker used for?', choices: [{ id: 'a', text: 'Version control' }, { id: 'b', text: 'Containerization' }, { id: 'c', text: 'Testing only' }], correctId: 'b' },
    { prompt: 'What is the default port for HTTPS?', choices: [{ id: 'a', text: '80' }, { id: 'b', text: '443' }, { id: 'c', text: '8080' }], correctId: 'b' },
  ],
  7: [
    { prompt: 'What is the CAP theorem?', choices: [{ id: 'a', text: 'Consistency, Availability, Partition tolerance' }, { id: 'b', text: 'Cache, API, Protocol' }, { id: 'c', text: 'Compute, Access, Persist' }], correctId: 'a' },
    { prompt: 'What does idempotent mean in APIs?', choices: [{ id: 'a', text: 'Same request multiple times = same effect as once' }, { id: 'b', text: 'Request is fast' }, { id: 'c', text: 'Request is encrypted' }], correctId: 'a' },
    { prompt: 'Which is not a NoSQL database?', choices: [{ id: 'a', text: 'MongoDB' }, { id: 'b', text: 'Redis' }, { id: 'c', text: 'PostgreSQL' }], correctId: 'c' },
    { prompt: 'What is OAuth used for?', choices: [{ id: 'a', text: 'Encryption' }, { id: 'b', text: 'Authorization / delegated access' }, { id: 'c', text: 'Compression' }], correctId: 'b' },
    { prompt: 'What is eventual consistency?', choices: [{ id: 'a', text: 'Data is never consistent' }, { id: 'b', text: 'Data becomes consistent over time' }, { id: 'c', text: 'Data is always immediately consistent' }], correctId: 'b' },
  ],
  8: [
    { prompt: 'What is a Bloom filter used for?', choices: [{ id: 'a', text: 'Sorting' }, { id: 'b', text: 'Probabilistic set membership' }, { id: 'c', text: 'Encryption' }], correctId: 'b' },
    { prompt: 'Explain event sourcing in one word.', choices: [{ id: 'a', text: 'Caching' }, { id: 'b', text: 'Replay' }, { id: 'c', text: 'Delete' }], correctId: 'b' },
    { prompt: 'What is the Byzantine fault tolerance?', choices: [{ id: 'a', text: 'Handling malicious or faulty nodes' }, { id: 'b', text: 'Network speed' }, { id: 'c', text: 'Data backup' }], correctId: 'a' },
    { prompt: 'What does ACID stand for?', choices: [{ id: 'a', text: 'Atomicity, Consistency, Isolation, Durability' }, { id: 'b', text: 'Access, Create, Insert, Delete' }, { id: 'c', text: 'API, Cache, Index, Data' }], correctId: 'a' },
    { prompt: 'What is a circuit breaker pattern?', choices: [{ id: 'a', text: 'Hardware component' }, { id: 'b', text: 'Fail-fast to avoid cascading failures' }, { id: 'c', text: 'Security tool' }], correctId: 'b' },
  ],
  9: [
    { prompt: 'What is the Paxos algorithm for?', choices: [{ id: 'a', text: 'Sorting' }, { id: 'b', text: 'Distributed consensus' }, { id: 'c', text: 'Hashing' }], correctId: 'b' },
    { prompt: 'What is tail recursion?', choices: [{ id: 'a', text: 'Recursion where the recursive call is the last operation' }, { id: 'b', text: 'Infinite loop' }, { id: 'c', text: 'Two recursive calls' }], correctId: 'a' },
    { prompt: 'What is a Merkle tree?', choices: [{ id: 'a', text: 'Binary tree of hashes' }, { id: 'b', text: 'B-tree variant' }, { id: 'c', text: 'Red-black tree' }], correctId: 'a' },
    { prompt: 'What does Raft consensus guarantee?', choices: [{ id: 'a', text: 'Speed' }, { id: 'b', text: 'Leader election and log replication' }, { id: 'c', text: 'Encryption' }], correctId: 'b' },
    { prompt: 'What is a CRDT?', choices: [{ id: 'a', text: 'Conflict-free replicated data type' }, { id: 'b', text: 'Cache replacement' }, { id: 'c', text: 'Compression algorithm' }], correctId: 'a' },
  ],
  10: [
    { prompt: 'What is the Chandy-Lamport snapshot used for?', choices: [{ id: 'a', text: 'Debugging' }, { id: 'b', text: 'Distributed snapshot / global state' }, { id: 'c', text: 'Load balancing' }], correctId: 'b' },
    { prompt: 'What is linearizability?', choices: [{ id: 'a', text: 'Operations appear to occur in a linear order' }, { id: 'b', text: 'Linear time algorithm' }, { id: 'c', text: 'Linear regression' }], correctId: 'a' },
    { prompt: 'What is a vector clock?', choices: [{ id: 'a', text: 'Clock with vectors' }, { id: 'b', text: 'Logical clock for causal ordering' }, { id: 'c', text: 'GPU clock' }], correctId: 'b' },
    { prompt: 'What does CALM conjecture state?', choices: [{ id: 'a', text: 'Consistency as Logical Monotonicity' }, { id: 'b', text: 'Monotonic programs are eventually consistent' }, { id: 'c', text: 'Both a and b' }], correctId: 'c' },
    { prompt: 'What is a split-brain scenario?', choices: [{ id: 'a', text: 'Two leaders in a cluster' }, { id: 'b', text: 'Network partition causing divergent state' }, { id: 'c', text: 'Dual-write pattern' }], correctId: 'b' },
  ],
};

// ✅ seeds questions; if force=true it wipes first
export async function runSeed({ force = false } = {}) {
  if (force) {
    await Question.deleteMany({});
  }

  let count = 0;
  for (const [diffStr, questions] of Object.entries(questionsByDifficulty)) {
    const difficulty = parseInt(diffStr, 10);
    for (const q of questions) {
      const correctAnswerHash = hashAnswer(q.correctId);
      await Question.create({
        difficulty,
        prompt: q.prompt,
        choices: q.choices,
        correctAnswerHash,
        tags: ['general'],
      });
      count++;
    }
  }
  return count;
}

// ✅ seeds ONLY if DB is empty (safe to call on every startup)
export async function seedIfEmpty() {
  const existing = await Question.countDocuments();
  if (existing > 0) {
    console.log(`Seed skipped: questions already exist (${existing})`);
    return 0;
  }
  const count = await runSeed({ force: false });
  console.log(`Seeded ${count} questions.`);
  return count;
}

async function main() {
  const force = process.argv.includes('--force');

  await mongoose.connect(config.mongoUri);

  if (force) {
    const count = await runSeed({ force: true });
    console.log(`Seeded ${count} questions (forced).`);
  } else {
    await seedIfEmpty();
  }

  await mongoose.disconnect();
}

if (process.argv[1] === __filename) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
