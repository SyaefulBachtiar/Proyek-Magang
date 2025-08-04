export default function Input ({
    className = "",
    label = "",
    id = "",
    name = "",
    value = "",
    onChange = "",
    onBlur = () => {}
}) {
    return (
        <>
            <div className="my-2 mb-6">
                <label htmlFor={id} className="font-bold">{label}</label>
                <input
                    id={id}
                    type="text"
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    className={`${
                        className ? className : ""
                    } w-full rounded-lg border border-gray-300`}
                />
            </div>
        </>
    );
}