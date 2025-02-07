export default function FAQSection() {
  return (
    <div className="bg-bgDark text-white p-10">
      <h2 className="font-bold text-3xl">
        The Problem: AI Doesn't Exist Fully On-Chain
      </h2>
      <p className="mb-4">
        <br />
        Despite rapid advances in AI, there is{" "}
        <span className="font-bold">no true on-chain AI model</span> that
        evolves within a smart contract. Current AI implementations rely heavily
        on <span className="font-bold">off-chain compute</span> (e.g., querying
        OpenAI, using off-chain reinforcement learning, oracles, etc.), making
        them centralized and disconnected from blockchain-native applications.
      </p>

      <p className="mb-4">
        Similarly,{" "}
        <span className="font-bold">NFTs today are static assets</span>, limited
        to visual metadata or upgradeable traits dictated by centralized
        sources. There is no real{" "}
        <span className="font-bold">on-chain personalization</span> where an NFT{" "}
        <span className="font-bold">
          adapts dynamically based on user interaction
        </span>
        .
      </p>

      <h2 className="text-3xl font-bold mb-6">
        Proof of Defeat: AI Personalization for NFTs
      </h2>

      <p className="mb-4">
        <span className="font-bold">Proof of Defeat (PoD)</span> introduces a
        paradigm where{" "}
        <span className="font-bold">
          NFTs learn and evolve based on how you play against them
        </span>
        . This means that over time, your NFT is{" "}
        <span className="font-bold">
          not just a digital asset, but a model of your strategy and playstyle
        </span>
        —a true representation of your ability in a given game.
      </p>

      <p className="mb-4">
        Instead of NFTs being just collectible images,{" "}
        <span className="font-bold">
          PoD NFTs can train, compete, and evolve
        </span>
        . Every NFT develops a{" "}
        <span className="font-bold">unique strategy</span>, making it{" "}
        <span className="font-bold">one-of-a-kind</span>, and{" "}
        <span className="font-bold">
          its strength is directly correlated with your skill level
        </span>
        .
      </p>

      <h2 className="text-3xl font-bold mb-6">
        Q-Learning: The On-Chain AI Primitive
      </h2>

      <p className="mb-4">
        <span className="font-bold">Why Q-Learning?</span>
        <br />
        Q-learning is a{" "}
        <span className="font-bold">
          model-free reinforcement learning algorithm
        </span>{" "}
        that learns optimal actions based on{" "}
        <span className="font-bold">state-action pairs</span>. It is a
        fundamental technique used in{" "}
        <span className="font-bold">
          AI-driven game playing, robotics, and self-learning agents
        </span>
        .
      </p>

      <p className="mb-4">
        At its core, Q-learning maintains a{" "}
        <span className="font-bold">Q-table</span>, which is a mapping of states
        (e.g., past moves in a game) to action values. Over time, as the NFT
        interacts with a player, it{" "}
        <span className="font-bold">updates its Q-values based on rewards</span>
        —reinforcing <span className="font-bold">good moves</span> and
        penalizing <span className="font-bold">bad ones</span>.
      </p>

      <p className="mb-4">
        For an on-chain setting,{" "}
        <span className="font-bold">
          Q-learning was chosen over more computationally intensive methods
          (e.g., neural networks) due to storage constraints
        </span>
        . However,{" "}
        <span className="font-bold">
          other learning methods could be integrated in future implementations
        </span>
        , such as:
      </p>

      <ul className="list-disc pl-6 mb-4">
        <li>
          <span className="font-bold">Expectimax / Minimax:</span> Optimal
          decision-making for deterministic games.
        </li>
        <li>
          <span className="font-bold">Monte Carlo Tree Search (MCTS):</span>{" "}
          Useful for more complex games requiring deep search.
        </li>
        <li>
          <span className="font-bold">Evolutionary Algorithms:</span> Using
          genetic programming to evolve strategies.
        </li>
      </ul>

      <h2 className="text-3xl font-bold mb-6">
        Rock-Paper-Scissors as a Proof-of-Concept
      </h2>

      <p className="mb-4">
        <span className="font-bold">Why Rock-Paper-Scissors?</span>
        <br />
        RPS may seem like a trivial game, but{" "}
        <span className="font-bold">
          human players exhibit strong behavioral biases
        </span>
        . Research has shown that:
      </p>

      <ul className="list-disc pl-6 mb-4">
        <li>
          Players <span className="font-bold">rarely play moves randomly</span>,
          leading to{" "}
          <a
            href="https://www.jcepm.com/article_104442_336761f3c9cf58702e352cc3d8d5ab20.pdf"
            className="font-bold underline"
          >
            predictable cycles
          </a>
          .
        </li>
        <li>
          <span className="font-bold">
            Pattern recognition and reinforcement learning
          </span>{" "}
          allow AI to{" "}
          <a
            href="https://medium.com/towards-data-science/a-beginners-guide-to-reinforcement-learning-using-rock-paper-scissors-and-tensorflow-js-37d42b6197b5"
            className="font-bold underline"
          >
            exploit these biases
          </a>{" "}
          and increase its win rate over time.
        </li>
        <li>
          AI trained on{" "}
          <span className="font-bold">historical human moves</span> can{" "}
          <span className="font-bold">outperform players</span> by learning
          optimal counter-strategies.
        </li>
      </ul>

      <h2 className="text-3xl font-bold mb-6">
        For Developers: Extend Proof of Defeat with Your Own Games
      </h2>

      <p className="mb-4">
        The <span className="font-bold">PoD smart contract is modular</span>,
        meaning developers can{" "}
        <span className="font-bold">integrate new games</span> into the
        framework.
      </p>

      <p className="mb-4">The only requirements are:</p>

      <ul className="list-disc pl-6 mb-4">
        <li>
          A <code className="bg-gray-800 p-1 rounded">choose_move()</code>{" "}
          function where the AI selects its action.
        </li>
        <li>
          An <code className="bg-gray-800 p-1 rounded">update_q_table()</code>{" "}
          function that updates the NFT’s Q-table based on game results.
        </li>
      </ul>

      <p className="mb-4">
        <span className="font-bold">Why is This Exciting?</span>
      </p>

      <ul className="list-disc pl-6 mb-4">
        <li>
          Build <span className="font-bold">new on-chain games</span> that{" "}
          <span className="font-bold">integrate reinforcement learning</span>.
        </li>
        <li>
          Use <span className="font-bold">different AI strategies</span> beyond
          Q-learning, such as{" "}
          <span className="font-bold">
            neural networks, genetic algorithms, or Monte Carlo search
          </span>
          .
        </li>
        <li>
          Design <span className="font-bold">multiplayer NFT competitions</span>{" "}
          where PoD NFTs battle using{" "}
          <span className="font-bold">optimized strategies</span>.
        </li>
      </ul>

      <h2 className="text-3xl font-bold mb-6">
        Compete: The Arena for AI NFTs
      </h2>

      <p className="mb-4">
        Once trained,{" "}
        <span className="font-bold">
          PoD NFTs can battle against other NFTs
        </span>{" "}
        in a competitive <span className="font-bold">on-chain arena</span>.
      </p>

      <ul className="list-disc pl-6 mb-4">
        <li>
          Players <span className="font-bold">train their NFTs</span> by playing
          against them.
        </li>
        <li>
          The NFT{" "}
          <span className="font-bold">learns and optimizes its strategy</span>{" "}
          over time.
        </li>
        <li>
          Once ready, players can{" "}
          <span className="font-bold">enter their NFT into competitions</span>{" "}
          and <span className="font-bold">win bounties</span> based on
          performance.
        </li>
      </ul>

      <p>
        Proof of Defeat is an experiment in{" "}
        <span className="font-bold">true on-chain AI</span>, combining{" "}
        <span className="font-bold">
          blockchain permanence with reinforcement learning
        </span>
        . Unlike static NFTs,{" "}
        <span className="font-bold">PoD NFTs evolve over time</span> and serve
        as <span className="font-bold">a digital representation of skill</span>.
        This opens up new frontiers for{" "}
        <span className="font-bold">
          game NFTs, personalized AI agents, and adaptive smart contract logic
        </span>
        .
      </p>
    </div>
  );
}
