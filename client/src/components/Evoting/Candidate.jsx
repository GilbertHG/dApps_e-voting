import {classNames} from "@headlessui/react/dist/utils/class-names";
import Alert from "./Alert";
import {useEffect, useState} from "react";
import {useEth} from "../../contexts/EthContext";

export default function Candidate() {

    const { state: { contract, accounts } } = useEth();
    const [value, setValue] = useState({
        candidates: [],
        winners: "",
        isError: false,
        errorMessage: ''
    });

    useEffect(() => {
        getCurrentVotes().then(r => {
            if (!r) return;
            let modifiedResult = r.map((item) => ({
                ...item,
                selected: false
            }));
            setValue(prevState => ({
                ...prevState,
                candidates: modifiedResult,
            }));
        });
    }, [contract]);

    const selectCandidate = function (id, e) {
        e.preventDefault();

        let modifiedResult = value.candidates.map((item, index) => ({
            ...item,
            selected: index === id
        }));
        setValue(prevState => ({
            ...prevState,
            candidates: modifiedResult
        }));
    }
    
    const voteCandidate = function (e) {
        e.preventDefault();

        if (value.candidates) {
            let indexObject = value.candidates.filter((item) => item.selected === true)[0];
            if (indexObject) {
                vote(value.candidates.indexOf(indexObject)).then(r => {
                    if (!r) return;
                    let modifiedResult = r.map((item) => ({
                        ...item,
                        selected: false
                    }));
                    setValue(prevState => ({
                        ...prevState,
                        candidates: modifiedResult
                    }));
                });
            }
        }
    }

    const getCurrentVotes = async () => {
        try {
            if (contract) {
                return await contract.methods.currentVotes().call()
            }
        } catch (e) {
            console.log(e);
        }
    };

    function extractJSON(str) {
        var firstOpen, firstClose, candidate;
        firstOpen = str.indexOf('{', firstOpen + 1);
        do {
            firstClose = str.lastIndexOf('}');
            console.log('firstOpen: ' + firstOpen, 'firstClose: ' + firstClose);
            if(firstClose <= firstOpen) {
                return null;
            }
            do {
                candidate = str.substring(firstOpen, firstClose + 1);
                console.log('candidate: ' + candidate);
                try {
                    var res = JSON.parse(candidate);
                    console.log('...found');
                    return [res, firstOpen, firstClose + 1];
                }
                catch(e) {
                    console.log('...failed');
                }
                firstClose = str.substr(0, firstClose).lastIndexOf('}');
            } while(firstClose > firstOpen);
            firstOpen = str.indexOf('{', firstOpen + 1);
        } while(firstOpen != -1);
    }

    const vote = async (id) => {
        try {
            if (contract) {
                await contract.methods.vote(id).send({ from: accounts[0] });
                getCurrentVotes().then(r => {
                    if (!r) return;
                    let modifiedResult = r.map((item) => ({
                        ...item,
                        selected: false
                    }));
                    setValue(prevState => ({
                        ...prevState,
                        candidates: modifiedResult,
                    }));
                });
            }
        } catch (e) {
            const extractJson = extractJSON(e.message)
            const errorMessage = extractJson ? extractJson[0].value.data.message : e.message;
            setValue(prevState => ({
                ...prevState,
                isError: true,
                errorMessage: errorMessage
            }));
        }
    };

    return (
        <>
            <div className="bg-white">
                <div className="mx-auto max-w-2xl py-16 px-4 sm:py-6 sm:px-6 lg:max-w-7xl lg:px-8 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Candidates</h2>
                        <div className="space-x-2">
                            <button
                                className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                                onClick={voteCandidate}>
                                Vote
                            </button>
                        </div>
                    </div>

                    <Alert isError={value.isError} errorMessage={value.errorMessage} />

                    <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                        {value.candidates.map((candidate, index) => (
                            <div key={index} onClick={(e) => selectCandidate(index, e)}
                                 className={classNames(
                                candidate.selected
                                    ? 'border-2 border-indigo-600 opacity-70'
                                    : '',
                                'group relative rounded-md'
                            )}>
                                <div className="min-h-80 aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 lg:aspect-none lg:h-80">
                                    <img
                                        src="https://img.freepik.com/premium-vector/anonymous-man-black-silhouette-with-question-mark-incognito-male-person-vector-illustration_261737-806.jpg"
                                        alt="candidate"
                                        className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                                    />
                                </div>
                                <div className="mt-4 flex justify-between">
                                    <div>
                                        <h3 className="text-sm text-gray-700">
                                            <a href="#">
                                                <span aria-hidden="true" className="absolute inset-0" />
                                                {candidate.name}
                                            </a>
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">{`Vote Count: ${candidate.voteCount}`}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}
