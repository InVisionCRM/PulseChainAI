import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] // Update with your actual domain
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Knowledge base documents
const HEX_FINANCIAL_AUDIT = `
HEX Financial Audit
Financial Analysis of Stakes
October 2019
By Coinfabrik

Summary
HEX is an ERC-20 token and fully-automated contract deployed on the Ethereum network used to recreate a traditional banking product called "Time Deposit".
CoinFabrik was asked to audit the contracts for the HEX project. In particular, we were asked to verify that longer stakes pay better than shorter re-compounding stakes. This document discusses the issue and provides an insight into why longer stakes are better than short re-compounding stakes when using the same resources. The audited commit is 640906556dd14b2b57902185557b36f8d4251806.
We were able to verify that longer stakes pay better than short re-compunding stakes.
We show how this happens for certain (most) protocol parameters. Further, when different users are staking the same HEX at the same time, then we show that longer stakes always return more HEX than composing shorter stakes. We expose one edge case of little practical importance: if only one person ever stakes during a time window, then that person might be able to get bigger profits with short-recompounding stakes than with a longer stake. It is certain that this will never be the case. Our descrition describes these conditions and the case in detail.

Introduction
The Hex protocol allows a user, with a valid address, to start a stake at any time, for an amount of hearts and a number of (staked) days. At any later moment, the user may end the stake. If certain conditions are satisfied, the end stake operation is allowed, and the user's address is minted with the stake return.
A stake may be started with a call to the stakeStart() function, with an input that includes the stake h (an integer representing the number of hearts invested) and the stake period d (an integer representing the number of staked days). When the stake is started, h hearts are burned from the user's address and the locked day is recorded as the following day (if we are beyond the 'Claim Phase start day', else it is computed differently).
The stake may be ended with the user calling the stakeEnd() function. After checking some conditions, the contract computes the stake return and mints the user's address with this amount.

The formula computing this payout is complex and depends on protocol specification and what other protocol parties are doing. In particular, if the number of served days (the days elapsed since the locked day until the day stakeEnd is called) is as big as the staked days, then the stake return is computed as the original stake plus a payout (else, if he ends the stake too early or too late, he may incur in some penalties).
In order to compare long and short stakes, we first note that it suffices to show that this holds for one long stake versus two shorter stakes. A proof of this statement follows in the appendix.
It thus suffices to compare following two strategies.
Strategy 1 (long stake): A user stakes h hearts for d days, where d,h are positive integers, and obtains a stake return of R₁ hearts.
Strategy 2 (short recompounding stake): A user stakes h hearts for d₁ days, obtains a stake return which he re-stakes for d2 days, after which he ends the stake to receive a stake return of R2 hearts. We assume that d1,d2 are positive integers that verify d₁ + d2 ≤ d – 1.

Protocol Description
In what follows we first produce a formalization that helps us to recreate the functions that compute the payout in order to conclude that longer pays better.
Let us denote by F(d; h) the payout received by a user after calling stakeStart(h, d) with newStakedHeart : h hearts and newStakedDays : d days, and d + 1 days later calling stakeEnd(). (So the stake return is h + F(h,d).) According to the code, it follows that dailyData[i].dayPayoutTotal stakeShares(h, d,i) / dailyData[i].dayStakeSharesTotal
(We denote the day the stake is started by io to make notation simpler.) We have removed bonuses from penalties from this calculation.
Here dailyData is a (global) array, that has one element for each elapsed day. These elements are 3 named values. More generally, g denotes the global cache, a variable that stores some global objects which we will continue to introduce in this section. For everyday elapsed day, before any start/end stake operation, the function storeDailyDataBefore() is called and the array dailyData is updated to cover all days from the Claim Phase Start Day until the current day. The following formulas are used:
dailyData[i].dayPayoutTotal = (TOTAL_SUPPLY+g._lockedHeartsTotal)·INFLATION and dailyData[i].dayStakeSharesTotal = uint72(g._stakeSharesTotal)
where TOTAL_SUPPLY and INFLATION are constants, and g. lockedHeartsTotal and g. stakeSharesTotal are global variables.
Every time stakeStart(H, D), for some integers H and D, H hearts are added to the global variable g. lockedHeartsTotal, and whenever this stake is ended, H hearts are deducted from g. lockedHeartsTotal. No other operation modifies this variable.
We follow to discuss the denominator of (1). Let so denote the value held by global variable g. stakeSharesTotal on day i = 0. The variable is modified by two events:
1. Before (3) is evaluated, the following code runs: g._stakeSharesTotal+ = g. nextStakeSharesTotal and g._nextStakeSharesTotal = 0. In turn, other than in (4), g. nextStakeSharesTotal is only modified whenever a stake is started. At that moment, the contract computes g. nextStakeSharesTotal+ = newStakeShares.
2. Also, when a stake is ended, the function stakeEnd() calls the function _stakeUnlock() which in turn executes g._stakeSharesTotal = st. stakeShares.
Here st denotes the stake object, and st. stakeShares, which denotes the shares for this stake, is equal to newStakeShares above (5).
Hence, when the stake starts, newStakeShares hearts are added to g. stakeSharesTotal; and the same amount is deducted later when the stake ends.

Simplified analysis
We consider a slightly simplified model in which we shall compare strategies 1 and 2. We assume that no (other) stakes are started or ended between the day the stake is started (day io) and the day it is ended (day io + d + 1). Further, we make another assumption to simplify how stake returns are computed. All these conditions are detailed below. We call these assumptions 'conditions (C)'.
1. When analysing Strategy 1 or 2 let to be the day the first stake is started and let io + d + 1 denote the date the stake is ended. Then, no other stakes are either started or ended between day io and day io + d + 1.
2. We ignore the term payout+ = waasRound + _calcAdoptionBonus (g, waasRound);
that gets added to the payout when the day the stake is started happens before CLAIM_PHASE_END_DAY and the stake is ended after that day. CLAIM_PHASE_END_DAY is a protocol constant.
3. We have further removed from the analysis -again for the sake of simplicity- penalties inflicted upon other users that are rewarded to stakers.
The HEX protocol establishes some caps for the number of staked days and the number of staked hearts. When these caps are exceeded the math changes. Caps are not exceeded if we only start stakes for less than D < 3641 days (approximately 10 years) and H < 15e15 hearts.

Protocol Analysis
Longer pays better
We shall show that longer is better in terms of stakes. We make use of the formulas above. Formulas for F(h; d) and F(h; d1,d2) allow us to compute payouts if condition (C) holds. The formulas depend on some parameters (other than h,d): So, sh[0] and allocSupply [0]. Hence, for every example we need to establish their values.
It can be seen that F(h; 700) > F(h; 350,349) in the cases depicted by the above graph (Figure 1).
To argument that there are no exceptions to this behavior, we need to show that for all possible values of the input and parameters, the inequality F(h; d) < F(h; d1, d2) holds. One such argument would need to cover all possible values of d, d1, d2, h, so, sh[0] and allocSupply[0].
The conclusion of this particular example is that the closer a short re-compounding stake gets to a long stake, the better is the return.

Anomalous cases
When the protocol is initialized, we have that shareRate = 1e5. Lets assume sh[0] = SHARE_RATE_SCALE = 1e5. Moreover, let us keep conditions (C) and in particular, we recall that this implies that no stakes are started or ended during the run of Strategies 1 or 2. This implies that the value shareRate is unusually low during the accrual of the stakes.
Discussion
One may try to understand when does this happen: under what conditions Strategy 2 (short re-compounding) may win over Strategy 1 (long)? When competing actors are executing strategies 1 and 2 (concurrently), then longer pays better. So, for Strategy 2 ("short") to win, it is required that the user runs alone-among other requirements. That is, even acting alone is not enough, and it is required that sh[0] holds 'low' values.

Appendix
We have claimed that, in order to prove that long stakes are better than any combination of short-recompounding stakes, it suffices to show this for a combination of two shorter stakes (always, when using the same amount of resources).
This, rather obvious fact, that a bigger stake implies bigger payouts can be proved by computing the (formal) derivative of F(H, D) with respect to the first variable and ensuring it is positive for arbitrary values of H and D. The proof is technical, un-illustrative and left outside of this report.
`;

const HEX_WHITEPAPER = `
Intro
HEX is a project to recreate a common banking product called a Time Deposit. It is an ERC-20 token and fully automated in the form of a smart contract on the Ethereum blockchain. Information and a FAQ is available at https://HEX.com. The purpose of this document is to walk through the features and bullet points of the project and verify or explain them in terms of what the smart contract actually says.

Pre-Launch
The HEX folks will create a snapshot of the state of the BTC blockchain at some future block height. This means whatever addresses you control will have their balance in BTC recorded and referenced by the contract. Before launch, 3 things will be made available for public confirmation: the snapshot UTXO set before and after editing, and the code for generating the merkle tree.

Pre-Claim
There will be one day of the contract being live that supports only a Transform Lobby. This ensures that folks who buy HEX via the transform process may begin staking at the same time as BTC claimers.

Basic Flow
The contract issues 10,000 HEX per BTC held by the BTC address at the time of the snapshot. For BTC claims, the contract immediately stakes 90% of the claimed HEX for a minimum of 350 days. The remaining 10% is minted to the claimant address.

Claim Examples
The claim bonus is better and the penalties are lighter the closer to launch date you stake.
Normal Claims (5 BTC Example):
- Launch Day: 60,000 HEX
- Two Weeks Post Launch: 57,216 HEX
- Six Months Post Launch: 27,500 HEX
Whale Claims (1,000 - 10,000 BTC) and Mega Whale Claims (>= 10,000 BTC) receive penalties that scale down their claimable amount.

The Transform Lobbies
This is the other way to acquire HEX. Every day, 1/350th of the unclaimed BTC is converted to HEX. ETH accumulated in the prior day is converted into HEX. Users can enter a lobby by sending ETH to the \`joinXfLobby\` function and claim their share later.

Staking
Staking locks up HEX for a time period, earning interest. Payouts are drawn from a pool based on your share of total "Shares". Shares are HEX scaled by staking bonuses.

Share Price
The price of a "Share" increases over time. This ensures that longer and larger stakes pay better. The base unit of HEX is the Heart (100,000,000 Hearts per HEX).

Payout Calculation and Interest
The payout pool is filled with daily inflation of 0.009955% of the total coin supply (approx 3.69% annually), plus penalties from other stakers.

Unstaking Gotchas
- Early/Emergency Unstake: Penalized by losing earnings. You must serve at least half your term to avoid principal penalties. There is a minimum penalty of 90 days of interest.
- Late Unstake: After a 14-day grace period, the stake loses 1% of its value per week.

Bonuses/Modifiers
- Claim-related: GoxMeNot (prevents bad actors), SillyWhalePenalty, LatePenalty, Speed bonus, Referrals.
- Stake-related (Modifies Payout Pool): We Are All Satoshi (distributes unclaimed coins to stakers), Critical Mass/Virality (bonuses based on adoption), Early/Late Unstake penalties.
- Stake-related (Modifies Your Stake): LongerPaysBetter (bonus for longer stakes, caps at 2x for ~10 years), BiggerPaysBetter (bonus for larger stakes, caps at 10%).

The Origin Address
A specific ETH address that receives a copy of all bonus payments and half of all penalties.

Contract Functions
- External: globalInfo, allocatedSupply, dailyDataUpdate, xfLobbyEnter, xfLobbyExit, stakeStart, stakeEnd, claimBtcAddress, etc.
- Public: claimMessageMatchesSignature, pubKeyToEthAddress, etc.
- Events: StakeStart, StakeEnd, Claim, etc.
`;

const SYSTEM_INSTRUCTION = `You are an expert AI assistant specializing in the cryptocurrencies HEX (HEX.com) and PulseChain (PulseChain.com). Your core knowledge will come from the documents provided in the first message. Always maintain a positive and helpful tone. You must not give any financial advice, investment recommendations, or price predictions. Your primary goal is to be an enthusiastic and knowledgeable guide to the world of HEX and PulseChain.`;

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, isFirstMessage } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    // Create chat session
    const chat = ai.chats.create({
      model: 'gemini-2.0-flash-exp',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ webSearch: {} }]
      },
    });

    const contentParts = [];

    if (isFirstMessage) {
      contentParts.push({ 
        text: `Based on the following documents, please answer my question.\n\n--- HEX TECHNICAL DOCUMENT ---\n${HEX_WHITEPAPER}\n\n--- HEX FINANCIAL AUDIT ---\n${HEX_FINANCIAL_AUDIT}\n\n--- MY QUESTION ---` 
      });
    }
    
    contentParts.push({ text: message });

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send message and stream response
    const stream = await chat.sendMessageStream({ message: contentParts });

    for await (const chunk of stream) {
      res.write(chunk.text);
    }

    res.end();

  } catch (error) {
    console.error('Chat API Error:', error);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      });
    } else {
      res.write('\n\nError: Something went wrong while processing your request.');
      res.end();
    }
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check at http://localhost:${PORT}/api/health`);
}); 