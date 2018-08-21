import { take, put, call } from 'redux-saga/effects';
import { receiveLog } from './logsActions';
import { eventChannel } from 'redux-saga';

function createLogEventChannel(instance, log) {
    const filter = instance[log]({}, { fromBlock: 0, toBlock: 'latest',  });
    return eventChannel(emit => {
        filter.watch((err, result) => {
            if (err) {
                emit(err);
            } else {
                emit(result);
            }
        });

        return () => {
            filter.stopWatching();
        };
    });
}

// Individual log channel saga
export default function* logSaga(artifact, instance, log) {
    //console.log(instance, log);
    const channel = yield call(createLogEventChannel, instance, log);

    try {
        while (true) {
            const ev = yield take(channel);
            yield put(receiveLog(artifact.contractName, ev));
            console.log('NEW LOG', ev);
        }
    } finally {
        console.log('Log watching stopped');
    }
};

// export default function* logsSaga() {
//     yield takeEvery(INIT_LOG, logSaga);
// };