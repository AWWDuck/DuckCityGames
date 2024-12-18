import { Devvit, useState, useInterval } from '@devvit/public-api';

Devvit.configure({ redditAPI: true });

Devvit.addMenuItem({
  label: 'Start Duck Pattern Game',
  location: 'subreddit',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    await reddit.submitPost({
      title: 'Duck Pattern Game',
      subredditName: subreddit.name,
      kind: 'image',
      videoPosterUrl: 'https://placeholder.com/poster.jpg'
    });
  },
});

Devvit.addCustomPostType({
  name: 'Duck Pattern Game',
  height: 'tall',
  render: (_context) => {
    const [score, setScore] = useState(0);
    const [currentPattern, setCurrentPattern] = useState<string[]>([]);
    const [playerPattern, setPlayerPattern] = useState<string[]>([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [round, setRound] = useState(1);
    const [highScore, setHighScore] = useState(0);
    const [difficulty, setDifficulty] = useState('normal');
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [showPattern, setShowPattern] = useState(true);
    const [countdown, setCountdown] = useState(3);

    const duckEmojis = ['🦆', '🦢', '🐥', '🐤', '🦅', '🦃'];

    // Difficulty button styles for each level
    const difficultyStyles = {
      easy: {
        active: {
          backgroundColor: '#4CAF50',
          color: '#ffffff',
          border: '2px solid #45a049',
          boxShadow: '0 0 15px rgba(76, 175, 80, 0.5)'
        },
        inactive: {
          backgroundColor: '#2a2a4a',
          color: '#9d9dff',
          border: '2px solid #3a3a6a'
        }
      },
      normal: {
        active: {
          backgroundColor: '#3498db',
          color: '#ffffff',
          border: '2px solid #2980b9',
          boxShadow: '0 0 15px rgba(52, 152, 219, 0.5)'
        },
        inactive: {
          backgroundColor: '#2a2a4a',
          color: '#9d9dff',
          border: '2px solid #3a3a6a'
        }
      },
      hard: {
        active: {
          backgroundColor: '#e74c3c',
          color: '#ffffff',
          border: '2px solid #c0392b',
          boxShadow: '0 0 15px rgba(231, 76, 60, 0.5)'
        },
        inactive: {
          backgroundColor: '#2a2a4a',
          color: '#9d9dff',
          border: '2px solid #3a3a6a'
        }
      }
    };

    const updateInterval = useInterval(() => {
      if (countdown > 0) {
        setCountdown(countdown - 1);
      } else {
        setShowPattern(false);
        updateInterval.stop();
      }
    }, 1000);

    const getDifficultyMultiplier = () => {
      switch(difficulty) {
        case 'easy': return 1;
        case 'normal': return 1.5;
        case 'hard': return 2;
        default: return 1;
      }
    };

    const startNewRound = () => {
      const baseLength = 2 + Math.floor(round / 3);
      const difficultyMultiplier = getDifficultyMultiplier();
      const patternLength = Math.min(Math.floor(baseLength * difficultyMultiplier), 10);
      
      const newPattern = Array(patternLength).fill(null).map(() => 
        duckEmojis[Math.floor(Math.random() * duckEmojis.length)]
      );
      setCurrentPattern(newPattern);
      setPlayerPattern([]);
      setGameStarted(true);
      setFeedback(`Watch the pattern! It will disappear in 3 seconds! (${difficulty.toUpperCase()} mode)`);
      setIsCorrect(null);
      setShowPattern(true);
      setCountdown(3);
      updateInterval.start();
    };

    const resetGame = () => {
      setScore(0);
      setRound(1);
      setCurrentPattern([]);
      setPlayerPattern([]);
      setGameStarted(false);
      setFeedback('');
      setIsCorrect(null);
      setShowPattern(true);
      setCountdown(3);
      updateInterval.stop();
    };

    const handleDuckPress = (duck: string) => {
      if (!gameStarted) return;

      const newPlayerPattern = [...playerPattern, duck];
      setPlayerPattern(newPlayerPattern);

      if (duck !== currentPattern[playerPattern.length]) {
        setFeedback(`Game Over! Final Score: ${score}`);
        if (score > highScore) {
          setHighScore(score);
          setFeedback(`New High Score! ${score} points!`);
        }
        setIsCorrect(false);
        setGameStarted(false);
        setShowPattern(true);
        return;
      }

      if (newPlayerPattern.length === currentPattern.length) {
        const newScore = score + (currentPattern.length * getDifficultyMultiplier());
        setScore(Math.floor(newScore));
        setRound(prevRound => prevRound + 1);
        setIsCorrect(true);
        setGameStarted(false);
        setShowPattern(true);
        setFeedback('Correct! Click Next Round to continue!');
      }
    };

    const changeDifficulty = (newDifficulty: string) => {
      setDifficulty(newDifficulty);
      setFeedback(`Difficulty changed to ${newDifficulty.toUpperCase()}`);
      resetGame();
    };

    return (
      <vstack 
        padding="large"
        style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          maxWidth: '900px',
          margin: '0 auto',
          border: '2px solid #4a4a82'
        }}
      >
        <vstack 
          gap="large"
          style={{
            textAlign: 'center',
            padding: '25px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '15px'
          }}
        >
          <text style={{ 
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#e2e2ff',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
          }}>
            Duck Pattern Game
          </text>
          
          <vstack gap="medium" style={{ alignItems: 'center' }}>
            <hstack 
              gap="large" 
              style={{
                justifyContent: 'center',
                backgroundColor: 'rgba(74, 74, 130, 0.3)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #4a4a82',
                width: '100%'
              }}
            >
              <text style={{ fontSize: '28px', color: '#9d9dff' }}>Round: {round}</text>
              <text style={{ fontSize: '28px', color: '#9d9dff' }}>Score: {score}</text>
              <text style={{ fontSize: '28px', color: '#ffd700' }}>High Score: {highScore}</text>
            </hstack>

            <text style={{ fontSize: '24px', color: '#e2e2ff', marginTop: '10px' }}>
              Select Difficulty:
            </text>

            <hstack gap="medium" style={{ justifyContent: 'center' }}>
              {['easy', 'normal', 'hard'].map((level) => (
                <button
                  key={level}
                  onPress={() => changeDifficulty(level)}
                  style={{
                    ...(difficulty === level 
                      ? difficultyStyles[level as keyof typeof difficultyStyles].active 
                      : difficultyStyles[level as keyof typeof difficultyStyles].inactive),
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '24px',
                    transition: 'all 0.3s ease',
                    transform: difficulty === level ? 'scale(1.1)' : 'scale(1)',
                    fontWeight: difficulty === level ? 'bold' : 'normal'
                  }}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </hstack>
          </vstack>
        </vstack>

        {/* Rest of the game UI remains exactly the same... */}
        <vstack padding="large" gap="large" style={{ alignItems: 'center' }}>
          {!gameStarted && !currentPattern.length && (
            <button
              onPress={startNewRound}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                padding: '25px 50px',
                borderRadius: '30px',
                fontSize: '32px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
              }}
            >
              Start Game
            </button>
          )}

          {currentPattern.length > 0 && (
            <vstack gap="large" style={{ alignItems: 'center', width: '100%' }}>
              <hstack gap="medium" style={{ alignItems: 'center' }}>
                <text style={{ fontSize: '28px', color: '#e2e2ff' }}>Pattern to match:</text>
                {gameStarted && showPattern && (
                  <text style={{ fontSize: '28px', color: '#ffd700' }}>
                    {countdown} seconds left
                  </text>
                )}
              </hstack>

              <hstack 
                gap="medium"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  padding: '30px',
                  borderRadius: '15px',
                  border: '1px solid #4a4a82',
                  minHeight: '100px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '90%'
                }}
              >
                {(showPattern || !gameStarted) && currentPattern.map((duck, index) => (
                  <text 
                    key={index.toString()} 
                    style={{ 
                      fontSize: '56px',
                      filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.3))'
                    }}
                  >
                    {duck}
                  </text>
                ))}
              </hstack>
              
              <hstack gap="medium" style={{ alignItems: 'center', width: '100%' }}>
                <text style={{ fontSize: '28px', color: '#e2e2ff' }}>Your pattern:</text>
                {isCorrect !== null && (
                  <text style={{
                    fontSize: '28px',
                    color: isCorrect ? '#4CAF50' : '#ff4444',
                    marginLeft: '10px'
                  }}>
                    {isCorrect ? '✓ Correct!' : '✗ Wrong!'}
                  </text>
                )}
              </hstack>

              <hstack 
                gap="medium"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  padding: '30px',
                  borderRadius: '15px',
                  border: '1px solid #4a4a82',
                  minHeight: '100px',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '90%'
                }}
              >
                <hstack gap="medium" style={{ flex: 1, justifyContent: 'center' }}>
                  {playerPattern.map((duck, index) => (
                    <text 
                      key={index.toString()} 
                      style={{ 
                        fontSize: '56px',
                        filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.3))'
                      }}
                    >
                      {duck}
                    </text>
                  ))}
                </hstack>
                
                {!gameStarted && (
                  <button
                    onPress={isCorrect ? startNewRound : resetGame}
                    style={{
                      backgroundColor: isCorrect ? '#9b59b6' : '#ff4444',
                      color: 'white',
                      padding: '15px 30px',
                      borderRadius: '20px',
                      fontSize: '24px',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(155, 89, 182, 0.3)',
                      marginLeft: '20px'
                    }}
                  >
                    {isCorrect ? 'Next Round' : 'Try Again'}
                  </button>
                )}
              </hstack>

              {gameStarted && (
                <hstack gap="medium" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
                  {duckEmojis.map((duck) => (
                    <button
                      key={duck}
                      onPress={() => handleDuckPress(duck)}
                      style={{
                        backgroundColor: '#4a4a82',
                        color: 'white',
                        padding: '30px',
                        borderRadius: '50%',
                        fontSize: '48px',
                        border: '2px solid #6a6aa2',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(74, 74, 130, 0.3)',
                        width: '100px',
                        height: '100px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {duck}
                    </button>
                  ))}
                </hstack>
              )}
            </vstack>
          )}
        </vstack>

        {feedback && (
          <text style={{
            textAlign: 'center',
            fontSize: '32px',
            color: feedback.includes('Correct') ? '#4CAF50' : 
                   feedback.includes('High Score') ? '#ffd700' : '#ff4444',
            padding: '20px',
            borderRadius: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            margin: '20px 0',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
          }}>
            {feedback}
          </text>
        )}
      </vstack>
    );
  },
});

export default Devvit;