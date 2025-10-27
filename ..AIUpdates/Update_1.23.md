<!-- markdownlint-disable MD033 -->
<!-- markdownlint-disable MD034 -->
# Update 1.23

## Next.js Issue

### Error Type

Console Error

### Error Message

A param property was accessed directly with `params.uuid`. `params` is a Promise and must be unwrapped with `React.use()` before accessing its properties. Learn more: <https://nextjs.org/docs/messages/sync-dynamic-apis>

    at BookingDetailsPage (src/app/bookings/[uuid]/page.js:130:58)

### Code Frame

  128 |                                 {booking.status?.replace('_', ' ').toUpperCase()}
  129 |                             </span>
> 130 |                             <a href={`/bookings/${params.uuid}/bids`} className="btn btn-warning me-2">
      |                                                          ^
  131 |                                 View Bids
  132 |                             </a>
  133 |                             <a href="/bookings" className="btn btn-outline-secondary">

Next.js version: 16.0.0 (Turbopack)

## Buttons

Add a margin/padding around buttons to ensure spacing

## Booking View Page (Shipper)

Hide UUID from the view page
Add a button to enter edit mode
Adjust the order of cards
1 Booking Info
2 Budget
3 Schedule
4 Route Information
5 Description
6 Requirements

## View Bids (Shipper)

forward-logs-shared.ts:95 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
forward-logs-shared.ts:95 [HMR] connected
page.js:51 A param property was accessed directly with `params.uuid`. `params` is a Promise and must be unwrapped with `React.use()` before accessing its properties. Learn more: <https://nextjs.org/docs/messages/sync-dynamic-apis>
error @ intercept-console-error.ts:42
warnForSyncAccess @ params.browser.dev.ts:66
get @ params.browser.dev.ts:44
BidReviewPage @ page.js:51
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooks @ react-dom-client.development.js:7972
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12092
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<BidReviewPage>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.tsx:83
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12041
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM2427 <anonymous>:1
Function.all @ VM2427 <anonymous>:1
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1876
(anonymous) @ react-server-dom-turbopack-client.browser.development.js:4515
initializeModelChunk @ react-server-dom-turbopack-client.browser.development.js:1768
resolveModelChunk @ react-server-dom-turbopack-client.browser.development.js:1623
processFullStringRow @ react-server-dom-turbopack-client.browser.development.js:4345
processFullBinaryRow @ react-server-dom-turbopack-client.browser.development.js:4205
processBinaryChunk @ react-server-dom-turbopack-client.browser.development.js:4418
progress @ react-server-dom-turbopack-client.browser.development.js:4689
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2702
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:4551
exports.createFromReadableStream @ react-server-dom-turbopack-client.browser.development.js:4954
module evaluation @ app-index.tsx:205
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateModuleFromParent @ dev-base.ts:162
commonJsRequire @ runtime-utils.ts:389
(anonymous) @ app-next-turbopack.ts:11
(anonymous) @ app-bootstrap.ts:79
loadScriptsInSequence @ app-bootstrap.ts:23
appBootstrap @ app-bootstrap.ts:61
module evaluation @ app-next-turbopack.ts:10
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateRuntimeModule @ dev-base.ts:128
registerChunk @ runtime-backend-dom.ts:57
await in registerChunk
registerChunk @ dev-base.ts:1149
(anonymous) @ dev-backend-dom.ts:126
(anonymous) @ dev-backend-dom.ts:126
page.js:67 A param property was accessed directly with `params.uuid`. `params` is a Promise and must be unwrapped with `React.use()` before accessing its properties. Learn more: <https://nextjs.org/docs/messages/sync-dynamic-apis>
error @ intercept-console-error.ts:42
warnForSyncAccess @ params.browser.dev.ts:66
get @ params.browser.dev.ts:44
BidReviewPage @ page.js:67
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooks @ react-dom-client.development.js:7972
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12092
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<BidReviewPage>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.tsx:83
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12041
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM2427 <anonymous>:1
Function.all @ VM2427 <anonymous>:1
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1876
(anonymous) @ react-server-dom-turbopack-client.browser.development.js:4515
initializeModelChunk @ react-server-dom-turbopack-client.browser.development.js:1768
resolveModelChunk @ react-server-dom-turbopack-client.browser.development.js:1623
processFullStringRow @ react-server-dom-turbopack-client.browser.development.js:4345
processFullBinaryRow @ react-server-dom-turbopack-client.browser.development.js:4205
processBinaryChunk @ react-server-dom-turbopack-client.browser.development.js:4418
progress @ react-server-dom-turbopack-client.browser.development.js:4689
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2702
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:4551
exports.createFromReadableStream @ react-server-dom-turbopack-client.browser.development.js:4954
module evaluation @ app-index.tsx:205
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateModuleFromParent @ dev-base.ts:162
commonJsRequire @ runtime-utils.ts:389
(anonymous) @ app-next-turbopack.ts:11
(anonymous) @ app-bootstrap.ts:79
loadScriptsInSequence @ app-bootstrap.ts:23
appBootstrap @ app-bootstrap.ts:61
module evaluation @ app-next-turbopack.ts:10
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateRuntimeModule @ dev-base.ts:128
registerChunk @ runtime-backend-dom.ts:57
await in registerChunk
registerChunk @ dev-base.ts:1149
(anonymous) @ dev-backend-dom.ts:126
(anonymous) @ dev-backend-dom.ts:126
page.js:51 A param property was accessed directly with `params.uuid`. `params` is a Promise and must be unwrapped with `React.use()` before accessing its properties. Learn more: <https://nextjs.org/docs/messages/sync-dynamic-apis>
error @ intercept-console-error.ts:42
warnForSyncAccess @ params.browser.dev.ts:66
get @ params.browser.dev.ts:44
BidReviewPage @ page.js:51
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12092
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<BidReviewPage>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.tsx:83
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12041
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM2427 <anonymous>:1
Function.all @ VM2427 <anonymous>:1
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1876
(anonymous) @ react-server-dom-turbopack-client.browser.development.js:4515
initializeModelChunk @ react-server-dom-turbopack-client.browser.development.js:1768
resolveModelChunk @ react-server-dom-turbopack-client.browser.development.js:1623
processFullStringRow @ react-server-dom-turbopack-client.browser.development.js:4345
processFullBinaryRow @ react-server-dom-turbopack-client.browser.development.js:4205
processBinaryChunk @ react-server-dom-turbopack-client.browser.development.js:4418
progress @ react-server-dom-turbopack-client.browser.development.js:4689
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2702
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:4551
exports.createFromReadableStream @ react-server-dom-turbopack-client.browser.development.js:4954
module evaluation @ app-index.tsx:205
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateModuleFromParent @ dev-base.ts:162
commonJsRequire @ runtime-utils.ts:389
(anonymous) @ app-next-turbopack.ts:11
(anonymous) @ app-bootstrap.ts:79
loadScriptsInSequence @ app-bootstrap.ts:23
appBootstrap @ app-bootstrap.ts:61
module evaluation @ app-next-turbopack.ts:10
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateRuntimeModule @ dev-base.ts:128
registerChunk @ runtime-backend-dom.ts:57
await in registerChunk
registerChunk @ dev-base.ts:1149
(anonymous) @ dev-backend-dom.ts:126
(anonymous) @ dev-backend-dom.ts:126
page.js:67 A param property was accessed directly with `params.uuid`. `params` is a Promise and must be unwrapped with `React.use()` before accessing its properties. Learn more: <https://nextjs.org/docs/messages/sync-dynamic-apis>
error @ intercept-console-error.ts:42
warnForSyncAccess @ params.browser.dev.ts:66
get @ params.browser.dev.ts:44
BidReviewPage @ page.js:67
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12092
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<BidReviewPage>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.tsx:83
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12041
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM2427 <anonymous>:1
Function.all @ VM2427 <anonymous>:1
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1876
(anonymous) @ react-server-dom-turbopack-client.browser.development.js:4515
initializeModelChunk @ react-server-dom-turbopack-client.browser.development.js:1768
resolveModelChunk @ react-server-dom-turbopack-client.browser.development.js:1623
processFullStringRow @ react-server-dom-turbopack-client.browser.development.js:4345
processFullBinaryRow @ react-server-dom-turbopack-client.browser.development.js:4205
processBinaryChunk @ react-server-dom-turbopack-client.browser.development.js:4418
progress @ react-server-dom-turbopack-client.browser.development.js:4689
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2702
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:4551
exports.createFromReadableStream @ react-server-dom-turbopack-client.browser.development.js:4954
module evaluation @ app-index.tsx:205
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateModuleFromParent @ dev-base.ts:162
commonJsRequire @ runtime-utils.ts:389
(anonymous) @ app-next-turbopack.ts:11
(anonymous) @ app-bootstrap.ts:79
loadScriptsInSequence @ app-bootstrap.ts:23
appBootstrap @ app-bootstrap.ts:61
module evaluation @ app-next-turbopack.ts:10
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateRuntimeModule @ dev-base.ts:128
registerChunk @ runtime-backend-dom.ts:57
await in registerChunk
registerChunk @ dev-base.ts:1149
(anonymous) @ dev-backend-dom.ts:126
(anonymous) @ dev-backend-dom.ts:126
page.js:51 A param property was accessed directly with `params.uuid`. `params` is a Promise and must be unwrapped with `React.use()` before accessing its properties. Learn more: <https://nextjs.org/docs/messages/sync-dynamic-apis>
error @ intercept-console-error.ts:42
warnForSyncAccess @ params.browser.dev.ts:66
get @ params.browser.dev.ts:44
BidReviewPage @ page.js:51
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooks @ react-dom-client.development.js:7972
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12092
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<BidReviewPage>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.tsx:83
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12041
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM2427 <anonymous>:1
Function.all @ VM2427 <anonymous>:1
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1876
(anonymous) @ react-server-dom-turbopack-client.browser.development.js:4515
initializeModelChunk @ react-server-dom-turbopack-client.browser.development.js:1768
resolveModelChunk @ react-server-dom-turbopack-client.browser.development.js:1623
processFullStringRow @ react-server-dom-turbopack-client.browser.development.js:4345
processFullBinaryRow @ react-server-dom-turbopack-client.browser.development.js:4205
processBinaryChunk @ react-server-dom-turbopack-client.browser.development.js:4418
progress @ react-server-dom-turbopack-client.browser.development.js:4689
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2702
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:4551
exports.createFromReadableStream @ react-server-dom-turbopack-client.browser.development.js:4954
module evaluation @ app-index.tsx:205
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateModuleFromParent @ dev-base.ts:162
commonJsRequire @ runtime-utils.ts:389
(anonymous) @ app-next-turbopack.ts:11
(anonymous) @ app-bootstrap.ts:79
loadScriptsInSequence @ app-bootstrap.ts:23
appBootstrap @ app-bootstrap.ts:61
module evaluation @ app-next-turbopack.ts:10
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateRuntimeModule @ dev-base.ts:128
registerChunk @ runtime-backend-dom.ts:57
await in registerChunk
registerChunk @ dev-base.ts:1149
(anonymous) @ dev-backend-dom.ts:126
(anonymous) @ dev-backend-dom.ts:126
page.js:67 A param property was accessed directly with `params.uuid`. `params` is a Promise and must be unwrapped with `React.use()` before accessing its properties. Learn more: <https://nextjs.org/docs/messages/sync-dynamic-apis>
error @ intercept-console-error.ts:42
warnForSyncAccess @ params.browser.dev.ts:66
get @ params.browser.dev.ts:44
BidReviewPage @ page.js:67
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooks @ react-dom-client.development.js:7972
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12092
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<BidReviewPage>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.tsx:83
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12041
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM2427 <anonymous>:1
Function.all @ VM2427 <anonymous>:1
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1876
(anonymous) @ react-server-dom-turbopack-client.browser.development.js:4515
initializeModelChunk @ react-server-dom-turbopack-client.browser.development.js:1768
resolveModelChunk @ react-server-dom-turbopack-client.browser.development.js:1623
processFullStringRow @ react-server-dom-turbopack-client.browser.development.js:4345
processFullBinaryRow @ react-server-dom-turbopack-client.browser.development.js:4205
processBinaryChunk @ react-server-dom-turbopack-client.browser.development.js:4418
progress @ react-server-dom-turbopack-client.browser.development.js:4689
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2702
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:4551
exports.createFromReadableStream @ react-server-dom-turbopack-client.browser.development.js:4954
module evaluation @ app-index.tsx:205
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateModuleFromParent @ dev-base.ts:162
commonJsRequire @ runtime-utils.ts:389
(anonymous) @ app-next-turbopack.ts:11
(anonymous) @ app-bootstrap.ts:79
loadScriptsInSequence @ app-bootstrap.ts:23
appBootstrap @ app-bootstrap.ts:61
module evaluation @ app-next-turbopack.ts:10
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateRuntimeModule @ dev-base.ts:128
registerChunk @ runtime-backend-dom.ts:57
await in registerChunk
registerChunk @ dev-base.ts:1149
(anonymous) @ dev-backend-dom.ts:126
(anonymous) @ dev-backend-dom.ts:126
page.js:51 A param property was accessed directly with `params.uuid`. `params` is a Promise and must be unwrapped with `React.use()` before accessing its properties. Learn more: <https://nextjs.org/docs/messages/sync-dynamic-apis>
error @ intercept-console-error.ts:42
warnForSyncAccess @ params.browser.dev.ts:66
get @ params.browser.dev.ts:44
BidReviewPage @ page.js:51
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12092
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<BidReviewPage>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.tsx:83
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12041
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM2427 <anonymous>:1
Function.all @ VM2427 <anonymous>:1
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1876
(anonymous) @ react-server-dom-turbopack-client.browser.development.js:4515
initializeModelChunk @ react-server-dom-turbopack-client.browser.development.js:1768
resolveModelChunk @ react-server-dom-turbopack-client.browser.development.js:1623
processFullStringRow @ react-server-dom-turbopack-client.browser.development.js:4345
processFullBinaryRow @ react-server-dom-turbopack-client.browser.development.js:4205
processBinaryChunk @ react-server-dom-turbopack-client.browser.development.js:4418
progress @ react-server-dom-turbopack-client.browser.development.js:4689
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2702
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:4551
exports.createFromReadableStream @ react-server-dom-turbopack-client.browser.development.js:4954
module evaluation @ app-index.tsx:205
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateModuleFromParent @ dev-base.ts:162
commonJsRequire @ runtime-utils.ts:389
(anonymous) @ app-next-turbopack.ts:11
(anonymous) @ app-bootstrap.ts:79
loadScriptsInSequence @ app-bootstrap.ts:23
appBootstrap @ app-bootstrap.ts:61
module evaluation @ app-next-turbopack.ts:10
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateRuntimeModule @ dev-base.ts:128
registerChunk @ runtime-backend-dom.ts:57
await in registerChunk
registerChunk @ dev-base.ts:1149
(anonymous) @ dev-backend-dom.ts:126
(anonymous) @ dev-backend-dom.ts:126
page.js:67 A param property was accessed directly with `params.uuid`. `params` is a Promise and must be unwrapped with `React.use()` before accessing its properties. Learn more: <https://nextjs.org/docs/messages/sync-dynamic-apis>
error @ intercept-console-error.ts:42
warnForSyncAccess @ params.browser.dev.ts:66
get @ params.browser.dev.ts:44
BidReviewPage @ page.js:67
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12092
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopSync @ react-dom-client.development.js:18729
renderRootSync @ react-dom-client.development.js:18710
performWorkOnRoot @ react-dom-client.development.js:17740
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
<BidReviewPage>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.tsx:83
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12041
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM2427 <anonymous>:1
Function.all @ VM2427 <anonymous>:1
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1876
(anonymous) @ react-server-dom-turbopack-client.browser.development.js:4515
initializeModelChunk @ react-server-dom-turbopack-client.browser.development.js:1768
resolveModelChunk @ react-server-dom-turbopack-client.browser.development.js:1623
processFullStringRow @ react-server-dom-turbopack-client.browser.development.js:4345
processFullBinaryRow @ react-server-dom-turbopack-client.browser.development.js:4205
processBinaryChunk @ react-server-dom-turbopack-client.browser.development.js:4418
progress @ react-server-dom-turbopack-client.browser.development.js:4689
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2702
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:4551
exports.createFromReadableStream @ react-server-dom-turbopack-client.browser.development.js:4954
module evaluation @ app-index.tsx:205
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateModuleFromParent @ dev-base.ts:162
commonJsRequire @ runtime-utils.ts:389
(anonymous) @ app-next-turbopack.ts:11
(anonymous) @ app-bootstrap.ts:79
loadScriptsInSequence @ app-bootstrap.ts:23
appBootstrap @ app-bootstrap.ts:61
module evaluation @ app-next-turbopack.ts:10
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateRuntimeModule @ dev-base.ts:128
registerChunk @ runtime-backend-dom.ts:57
await in registerChunk
registerChunk @ dev-base.ts:1149
(anonymous) @ dev-backend-dom.ts:126
(anonymous) @ dev-backend-dom.ts:126
page.js:64 A param property was accessed directly with `params.uuid`. `params` is a Promise and must be unwrapped with `React.use()` before accessing its properties. Learn more: <https://nextjs.org/docs/messages/sync-dynamic-apis>
error @ intercept-console-error.ts:42
warnForSyncAccess @ params.browser.dev.ts:66
get @ params.browser.dev.ts:44
BidReviewPage.useEffect @ page.js:64
react_stack_bottom_frame @ react-dom-client.development.js:28010
runWithFiberInDEV @ react-dom-client.development.js:984
commitHookEffectListMount @ react-dom-client.development.js:13611
commitHookPassiveMountEffects @ react-dom-client.development.js:13698
commitPassiveMountOnFiber @ react-dom-client.development.js:16638
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16915
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16658
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
commitPassiveMountOnFiber @ react-dom-client.development.js:16630
recursivelyTraversePassiveMountEffects @ react-dom-client.development.js:16583
<BidReviewPage>
exports.jsx @ react-jsx-runtime.development.js:342
ClientPageRoot @ client-page.tsx:83
react_stack_bottom_frame @ react-dom-client.development.js:27925
renderWithHooksAgain @ react-dom-client.development.js:8072
renderWithHooks @ react-dom-client.development.js:7984
updateFunctionComponent @ react-dom-client.development.js:10480
beginWork @ react-dom-client.development.js:12041
runWithFiberInDEV @ react-dom-client.development.js:984
performUnitOfWork @ react-dom-client.development.js:18901
workLoopConcurrentByScheduler @ react-dom-client.development.js:18895
renderRootConcurrent @ react-dom-client.development.js:18877
performWorkOnRoot @ react-dom-client.development.js:17739
performWorkOnRootViaSchedulerTask @ react-dom-client.development.js:20288
performWorkUntilDeadline @ scheduler.development.js:45
"use client"
Function.all @ VM2427 <anonymous>:1
Function.all @ VM2427 <anonymous>:1
initializeElement @ react-server-dom-turbopack-client.browser.development.js:1876
(anonymous) @ react-server-dom-turbopack-client.browser.development.js:4515
initializeModelChunk @ react-server-dom-turbopack-client.browser.development.js:1768
resolveModelChunk @ react-server-dom-turbopack-client.browser.development.js:1623
processFullStringRow @ react-server-dom-turbopack-client.browser.development.js:4345
processFullBinaryRow @ react-server-dom-turbopack-client.browser.development.js:4205
processBinaryChunk @ react-server-dom-turbopack-client.browser.development.js:4418
progress @ react-server-dom-turbopack-client.browser.development.js:4689
"use server"
ResponseInstance @ react-server-dom-turbopack-client.browser.development.js:2702
createResponseFromOptions @ react-server-dom-turbopack-client.browser.development.js:4551
exports.createFromReadableStream @ react-server-dom-turbopack-client.browser.development.js:4954
module evaluation @ app-index.tsx:205
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateModuleFromParent @ dev-base.ts:162
commonJsRequire @ runtime-utils.ts:389
(anonymous) @ app-next-turbopack.ts:11
(anonymous) @ app-bootstrap.ts:79
loadScriptsInSequence @ app-bootstrap.ts:23
appBootstrap @ app-bootstrap.ts:61
module evaluation @ app-next-turbopack.ts:10
(anonymous) @ dev-base.ts:244
runModuleExecutionHooks @ dev-base.ts:278
instantiateModule @ dev-base.ts:238
getOrInstantiateRuntimeModule @ dev-base.ts:128
registerChunk @ runtime-backend-dom.ts:57
await in registerChunk
registerChunk @ dev-base.ts:1149
(anonymous) @ dev-backend-dom.ts:126
(anonymous) @ dev-backend-dom.ts:126
