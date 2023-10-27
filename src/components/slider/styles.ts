const styles = {
    thickness: 5,
    track: "bg-gray-500-0 rounded-sm",
    handle: "bg-gray-700-0 hover:bg-gray-800-0 active:bg-gray-600-0 rounded-sm",
    handleSize: [20, 10],
};

export default {
    ...styles,
    handleOffset: [(styles.handleSize[0] - styles.thickness) / 2, styles.handleSize[1] / 2],
};
