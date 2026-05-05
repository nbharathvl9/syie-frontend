"use client";

export const QUICK_REACTION_EMOJIS = ['👍', '❤️', '😂', '🎉', '🔥'];

export default function ReactionBar({
    reactions = [],
    currentUserRoll,
    onToggle,
    compact = false,
    className = ''
}) {
    return (
        <div className={`flex flex-wrap gap-2 ${className}`.trim()}>
            {QUICK_REACTION_EMOJIS.map((emoji) => {
                const count = reactions.filter((reaction) => reaction.emoji === emoji).length;
                const isActive = reactions.some(
                    (reaction) => reaction.emoji === emoji && reaction.authorRoll === currentUserRoll
                );

                return (
                    <button
                        key={emoji}
                        type="button"
                        onClick={() => onToggle(emoji)}
                        aria-pressed={isActive}
                        className={[
                            "inline-flex items-center gap-1.5 rounded-full border transition-all",
                            compact ? "px-2 py-1 text-[11px]" : "px-2.5 py-1.5 text-xs",
                            isActive
                                ? "border-black bg-black text-white"
                                : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:text-black"
                        ].join(' ')}
                    >
                        <span>{emoji}</span>
                        {count > 0 && <span className="font-bold">{count}</span>}
                    </button>
                );
            })}
        </div>
    );
}
