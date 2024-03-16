pragma solidity >=0.7.5;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ISwapRouter02} from "@uniswap/swap-router-contracts/contracts/interfaces/ISwapRouter02.sol";
import {IV3SwapRouter} from "@uniswap/swap-router-contracts/contracts/interfaces/IV3SwapRouter.sol";


contract DcaExecutor {
    struct DcaRequest {
        address receiver;
        IERC20 token1;
        IERC20 token2;
        uint256 token1InitialAmount;
        uint256 token1CurrentAmount;
        uint256 token2CurrentAmount;
        ISwapRouter02 router;
        uint256 swapExecutionPeriod;
        uint256 startTimestamp;
        uint256 numberOfSwapsToExecute;
        uint256 numberOfSwapsExecuted;
        uint256 lastExecutionTimestamp;
    }

    address[] public receivers;
    mapping(address => DcaRequest[]) public dcaRequests;
    mapping(address => DcaRequest[]) public dcaRequestsCompleted;

    event Deposited(address indexed receiver, address token1Address, uint256 token1Amount, address token2Address, ISwapRouter02 router, uint256 swapExecutionPeriod, uint256 swapStartTime, uint256 numberOfSwaps);
    event Swapped(address indexed receiver, address token1Address, uint256 token1Amount, address token2Address, uint256 token2Amount);
    event Cancelled(address indexed receiver, uint256 index);
    event Completed(address indexed receiver, uint256 index);

    // approve the contract to spend the token
    function submitDcaRequest(
        IERC20 token1,
        IERC20 token2,
        uint256 token1Amount,
        ISwapRouter02 router,
        uint256 numberOfSwaps,
        uint256 swapExecutionPeriod,
        uint256 startTimestamp
    ) external {
        require(token1.transferFrom(msg.sender, address(this), token1Amount), "funding transfer failed");
        receivers.push(msg.sender);
        dcaRequests[msg.sender].push(
            DcaRequest(
                {
                    receiver: msg.sender,
                    token1: token1,
                    token2: token2,
                    token1InitialAmount: token1Amount,
                    token1CurrentAmount: token1Amount,
                    token2CurrentAmount: 0,
                    router: router,
                    swapExecutionPeriod: swapExecutionPeriod,
                    startTimestamp: startTimestamp,
                    numberOfSwapsToExecute: numberOfSwaps,
                    numberOfSwapsExecuted: 0,
                    lastExecutionTimestamp: 0
                }
            )
        );
        token1.approve(address(router), token1Amount);
        emit Deposited(msg.sender, address(token1), token1Amount, address(token2), router, swapExecutionPeriod, startTimestamp, numberOfSwaps);
    }

    function executeSwap(address receiver, uint256 index) external {
        DcaRequest memory request = dcaRequests[receiver][index];
        require(block.timestamp >= request.startTimestamp, "start date not reached");
        require(request.numberOfSwapsToExecute > 0, "no more swaps");
        require(block.timestamp >= request.lastExecutionTimestamp + request.swapExecutionPeriod, "swap execution period not reached");

        uint256 amountIn = request.token1CurrentAmount / request.numberOfSwapsToExecute;
        IV3SwapRouter.ExactInputSingleParams memory params = IV3SwapRouter
            .ExactInputSingleParams({
                tokenIn: address(request.token1),
                tokenOut: address(request.token2),
                fee: 3000,
                recipient: address(this),
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        uint256 amountOut = request.router.exactInputSingle(params);
        request.numberOfSwapsToExecute--;
        request.numberOfSwapsExecuted++;
        request.token1CurrentAmount -= amountIn;
        request.token2CurrentAmount += amountOut;
        request.lastExecutionTimestamp = block.timestamp;
        dcaRequests[receiver][index] = request;
        emit Swapped(receiver, address(request.token1), amountIn, address(request.token2), amountOut);

        if (request.numberOfSwapsToExecute == 0) {
            _completeRequest(receiver, index);
            emit Completed(receiver, dcaRequestsCompleted[receiver].length - 1);
        }
    }

    function cancelDcaRequest(address receiver, uint256 index) external {
        require(receiver == msg.sender, "not authorized");
        _completeRequest(receiver, index);
        emit Cancelled(receiver, dcaRequestsCompleted[receiver].length - 1);
    }

    function _completeRequest(address receiver, uint256 index) private {
        DcaRequest memory request = dcaRequests[receiver][index];
        require(request.token1.transfer(receiver, request.token1CurrentAmount), "transfer failed");
        require(request.token2.transfer(receiver, request.token2CurrentAmount), "transfer failed");
        dcaRequestsCompleted[receiver].push(request);
        dcaRequests[receiver][index] = dcaRequests[receiver][dcaRequests[receiver].length - 1];
        dcaRequests[receiver].pop();
    }
}
