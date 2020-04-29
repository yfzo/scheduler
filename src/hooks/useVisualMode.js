import { useState } from "react";

export default function useVisualMode(initial) {
    const [mode, setMode] = useState(initial);
    const [history, setHistory] = useState([initial]);

    function transition(newMode, replace = false) {
        setMode(newMode);
        if (replace) {
            setHistory(prev => {
                const curr = [...prev];
                curr[curr.length - 1] = newMode;
                return curr;
            })
        } else {
            setHistory(prev => [...prev, newMode]);
        }
    }

    function back() {
        if (history.length > 1) {
            setMode(history[history.length - 2]);
            setHistory(prev => prev.filter((_, i) => i !== history.length - 1))
        }
    }

    return { mode, transition, back };
}
