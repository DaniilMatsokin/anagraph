import { Meta, StoryObj } from "@storybook/react";
import { BoundsManager, Chart, Line } from "../lib";

export default {
    title: "Anagraph V2/Chart",
    component: Chart,
} satisfies Meta<typeof Chart>;

type Story = StoryObj<typeof Chart>;

export const Simple: Story = {
    args: {
        settings: {
            grid: {
                background: "#ffffd0",
                y: { bounds: [-1, 10] },
            },
        },

        disableWorker: false,

        style: {
            outline: "1px solid #ccc",
        },

        children: [
            <Line
                key={1}
                yBounds={[-1, 10]}
                points={[
                    [-3, 9],
                    [-2, 4],
                    [-1, 1],
                    [0, 0],
                    [1, 1],
                    [2, 4],
                    [3, 9],
                ]}
                color="#3b73c4"
                lineWidth={2}
            />,
        ],
    },

    decorators: [
        (Story) => (
            <BoundsManager initialXBounds={[-10, 10]}>
                <Story />
            </BoundsManager>
        ),
    ],
};
