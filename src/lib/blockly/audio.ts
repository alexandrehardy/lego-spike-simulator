import * as Blockly from 'blockly/core';

export const cat =
    ' \
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 \
4KwSKRGqMDV2UjfMvdOigMgJvER82M7DHStqPZdkrPFKLlPiy/QAA7tTgAbdmAARUD2dfjMArAJ3 \
8on8BH6f7OS/lybBCTLgoFP5KyAuh6HqEAPw0s7mSxkuXpK9SEoAyy/UgPgLI+yusFlq/+SRt9ZY \
f/V+MULi1NFU4eCppzAEEi1QUCRodQd/1+sACJawYA9HsXQKsSr5eHND7VEkWrfj/5////UF//tg \
ZO2AEq8oU/g4aPgb5RpdHAKzDDDtQeFhpaBkEGm8oArMf8qGFWBK8qLMIQAA31ANCJX2gmYQNN0w \
16a24h01a5tCVQOCLNnBUAgaqz//b5wExx//zx4bADdBlHhmAAG/DEHjCtXEp6C7a+3sBMqYD84Z \
0QkA0s3jrGr//GWTnALLuj4eMwCa98e4Qr+CgFFLn50+Kg1/Rvq9wAZ7ectEb6/9hNMnv7YY/hNg \
OSPC2hhvw6hfXR6I/kbuC1M2oIkuf6QWAGrKho1+3K/1qmA8HcK4IAAA30AeCm+pbgnt3gwr4Oqf \
6OGO/47//7/ghlAHh4Vwf4VAABvwWkXN3EIQltLy//twZOeAE2E0T3sNHNgdwipPAaIpCQStQ+C9 \
paB9EGj8CRSc79FQi353/4Nn5VD5z8Mb8nIKfqAFgSr5cGFLLVTEkv/w38shgw8ArH79YYSC3nQW \
1/dA3//6v4iqIAQUFGAL8l8gR79dEOn1o6AAP9ACn4QDWQF/j4uU7jo//6gJBIX7UINw6pDfWFGQ \
fqhrdUxBTUUzLjEwMFVVVVVVVVVVVVVVVQABMABfmBpvzwAmQAMgAF+YNDvoD1+gDFMf5UAlgFL8 \
wIm/QHzqTEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq \
qqqqqqqqqqqq/kQEAABfwJ5MQU1FMy4xMDCqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq \
qv/7UET5ARGPJ83pTzrKLgQZ3SnnOwSkUTmgvWVgiIhmtNehlKqqqqqqqqqqqqqqqqqqqqqqqqqq \
qqqqqqqqqkxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq \
qqqqqqqqqqqqqqqqqqqqqqqqTEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq \
qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpMQU1FMy4xMDD/+yBE+wERCCBNaU8TKB5D+f8c \
AsEDHH8tJoBWQFSIZaQQNAiqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq \
qqqqqqqqqqqqqqqqqqqqqqqqqkxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//sQ \
ZPMDsIYNTFgtexgSAZloAE8mAPwjLQCASGAjBmUgBqzkqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq \
qqqqqqqqqqqqTEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+xBE8IswWAzKwCA5 \
qAvBiVgEBzQA0DMpAIDhYCCGZNQQHNaqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq \
qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqv/7EGThj/AOAMmAAAAIBgGZBQACJwAA \
Af4AAAAgAAA/wAAABKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq \
qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//sQZN2P8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSA \
AAAEqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq \
qqqqqqqqqqqqqqqqqqr/+xBk3Y/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAASqqqqqqqqq \
qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq \
qqqqqv/7EGTdj/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABKqqqqqqqqqqqqqqqqqqqqqq \
qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//sQZN2P \
8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq \
qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+xBk3Y/wAABpAAAACAAA \
DSAAAAEAAAGkAAAAIAAANIAAAASqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq \
qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqg== \
';

export interface LibraryItem {
    name: string;
    id: string;
}

export const SoundLibrary = new Map<string, string>();
SoundLibrary.set('Alert', '226c1f75543742a2c8cfdc8cade1a44f');
SoundLibrary.set('Applause 1', 'de3222537c62c9fcb4e83bca9b6a17f7');
SoundLibrary.set('Applause 2', '8ad2a599b9b665da7fa076608e14f686');
SoundLibrary.set('Applause 3', '1ee37cad70f4bfab4f6453bf0835f30c');
SoundLibrary.set('Baa', 'ec539c61658a4fb5485828bac8ab6657');
SoundLibrary.set('Bang 1', '15caabaea7aeb628ad8c4a53d52baddd');
SoundLibrary.set('Bang 2', '4e8ef70b13120e455e2d1a5a92a61fe6');
SoundLibrary.set('Basketball Bounce', 'a76a51b0ff69b94ffee61ffbe4d51a3d');
SoundLibrary.set('Big Boing', '54961d6095cb1848ca39f02195e4e56a');
SoundLibrary.set('Bird', 'aa2b9878f5bcd07f550f883d7242ee4a');
SoundLibrary.set('Bite', 'd2f8ea39da1dc71d514cb48c64be21e8');
SoundLibrary.set('Boat Horn 1', '5d2ad459724420ad8ac96ac4585f031e');
SoundLibrary.set('Boat Horn 2', '6475e7b4d3459c15cf041e74a6c15288');
SoundLibrary.set('Bonk', '1c95c92b3d7ff64a3fda063ccc25f19c');
SoundLibrary.set('Boom Cloud', 'dbb83cf1a8cb987025a110ee52d362d0');
SoundLibrary.set('Boop Bing Bop', '80e12f913b43224b3043493f9795ae4f');
SoundLibrary.set('Bowling Strike', 'e11f42b11503515a1e20a6769a633404');
SoundLibrary.set('Bricks 1', '040a3880640eea1db53ef19b3312fb5a');
SoundLibrary.set('Bricks 2', 'bda50d6b82f2356dd5164d00da2dbe26');
SoundLibrary.set('Bricks 3', 'ae52d02c155bbd1f042845db591652c7');
SoundLibrary.set('Burp 1', 'f199755b832d9b66be2f5f71ba65c1ac');
SoundLibrary.set('Burp 2', '5f54d705e30122549ef7a34bdeae5798');
SoundLibrary.set('Burp 3', '65c5a143d6b74474b5f0dc3f20ffde67');
SoundLibrary.set('Bus Door', 'c8488b99f82fd58d6542f147fae62a07');
SoundLibrary.set('Cafe', '0cc877019670b140c436ba7b878c87a1');
SoundLibrary.set('Campfire Music', '7eef0f63941e7b658e9fb478ef3bda2e');
SoundLibrary.set('Car Accelerate 1', 'ce563ac1140b01672912029189de26a3');
SoundLibrary.set('Car Accelerating 2', '0d0418939899c03cf689b2fae6266499');
SoundLibrary.set('Car Horn', 'c29c2e60e09379fb08e7cc55b537c924');
SoundLibrary.set('Car Idle', 'dca5b37f2206f3aa1c54634a8977259e');
SoundLibrary.set('Car Reverse', '0f489c63c610a21ee79086e4e299a67b');
SoundLibrary.set('Car Skid 1', 'ba5264f59368cd9dd676eb3bcbb40814');
SoundLibrary.set('Car Skid 2', 'cb306b6bfd3f8aeec9b3b1d30142bc2d');
SoundLibrary.set('Car Vroom', 'cee6efc6ebc17d8963df78060dab7151');
SoundLibrary.set('Cat Angry', 'a14613f684332cbf2b544f2264228292');
SoundLibrary.set('Cat Happy', 'db42921e5d2619ebcba1585a7f9e141e');
SoundLibrary.set('Cat Hiss', '0bef0a1eb6beb6320c2430424eca149a');
SoundLibrary.set('Cat Meow 1', '27de32233d1c6cf0fd17f6d048721541');
SoundLibrary.set('Cat Meow 2', '39000408e68eb1a858c2e11ebe9bc62e');
SoundLibrary.set('Cat Meow 3', '00d98ddf73fb7db1f3bcfbfc3a44f051');
SoundLibrary.set('Cat Purring', '21944c455407e32cab569809d830d873');
SoundLibrary.set('Cat Whining', '702c08a469ed48e5d3399d457c456bdc');
SoundLibrary.set('Cave', '00f66ff2af0151096d60d919f8bb091f');
SoundLibrary.set('Chatter', '9ef450bb7133058b2d941513851bee7e');
SoundLibrary.set('Chirp', '5bbe911c04885b3e5923788d0a784153');
SoundLibrary.set('Clang', '14f4b8cf1c99941e8ac9c0c06a41c7c3');
SoundLibrary.set('Clock Ticking', 'e58cad83b3528ed53ff2e035c49c1532');
SoundLibrary.set('Clown Honk 1', '410ee7ce46bd6817775d47b8b6587612');
SoundLibrary.set('Clown Honk 2', '532f4f373c86faadfb3ac322a9b1eb38');
SoundLibrary.set('Clown Honk 3', 'abc89db49c1b6964464414f17f2a8a3e');
SoundLibrary.set('Coin', '7a7e3f8bd011abf2dd2a39f16e6810e8');
SoundLibrary.set('Collect', 'd54c15a844173ad395c7f4c9cf704072');
SoundLibrary.set('Connect', 'a9d843efba44891c07d3ec6799a30ca4');
SoundLibrary.set('Crank', 'a84d2f78cec6b4ea0a9ae36cc5cf22eb');
SoundLibrary.set('Crash', '2df4388a555bdc31a4ea23217e42acb7');
SoundLibrary.set('Crazy Laugh', '90d14f634e8819f37fc9de2535701e42');
SoundLibrary.set('Croak', '73fce8e8f1063f1c5606d1f51efa45ed');
SoundLibrary.set('Crocodile', '1588fd382ac899e2713c27ec280785af');
SoundLibrary.set('Crowd Gasp', '5bf8795f970cd78f0b5f48ef3a4fa4de');
SoundLibrary.set('Crunch', 'ae1ecd768cd4862028b3fc1b4b324883');
SoundLibrary.set('Cuckoo', 'db2e86ed6d23e4799400b35019fe669b');
SoundLibrary.set('Cymbal Crash', '5f244278645b97bf7e732999bc2c9705');
SoundLibrary.set('Dance Music', '35756f4d0623307826f5685d5b503029');
SoundLibrary.set('Disconnect', '69ab06c2511c11bafb0cd65d58d4574e');
SoundLibrary.set('Dog Bark 1', '06e05c539e03cde67d7d825975dafe59');
SoundLibrary.set('Dog Bark 2', 'bc0a58d4ce4663a1b328a9ecebfb94a6');
SoundLibrary.set('Dog Bark 3', '379608d8b5892da76177948bad003dcb');
SoundLibrary.set('Dog Whining 1', '42999f5d324fcbed0b4221eedefcdbfb');
SoundLibrary.set('Dog Whining 2', '52931a6f43b07a456b3b48643c9b18aa');
SoundLibrary.set('Dolphin', '88023edbc74704ff912c8693c15e2c2b');
SoundLibrary.set('Door Closing', '128724844802e352b8dbd17b8f877082');
SoundLibrary.set('Door Creek 1', '45cb641b32df3359e73fbe80d9f842e1');
SoundLibrary.set('Door Creek 2', '14aa94d4a57e07bbaafe6fc1ed3bcbae');
SoundLibrary.set('Door Handle', '9f95a5ed0534bbc5419954fec46e8c6b');
SoundLibrary.set('Door Knock', 'b4a23a5dbad71005e78aeafd908984f8');
SoundLibrary.set('Door Slam 1', 'c881a350901c41723dff27d232d7dd78');
SoundLibrary.set('Door Slam 2', '38df9690ba979151c83cf1c66bc4996f');
SoundLibrary.set('Doorbell 1', '78a00c90119b30ac87bade728ada306a');
SoundLibrary.set('Doorbell 2', 'a5b478b0aca7e93364a11d015f6a508f');
SoundLibrary.set('Doorbell 3', 'ec43231552539647da88a8e82b77bb26');
SoundLibrary.set('Dragon', '7145cb6f4b81f920c23c894fbd1cbeb0');
SoundLibrary.set('Drum Music', '907cd6c9994815fab5a0233c57be5912');
SoundLibrary.set('Drum Roll', '8fdcec1bd25fe7eeca97c60eca51f208');
SoundLibrary.set('Dubstep Music', '6456ee3be275e901c3d9b4b69225638f');
SoundLibrary.set('Dun Dun Dunnn', 'd1af4162d0f6989bf491fdd4ac1f72f1');
SoundLibrary.set('Emotional Piano', '43087ee1cf886a491cc5a591161c9b40');
SoundLibrary.set('Fart 1', '5a62eb8fc404cf00714d73a5f28265d2');
SoundLibrary.set('Fart 2', '2015e1761afcbe78b050a734d7b62af0');
SoundLibrary.set('Fart 3', 'fd4ca61076bc640660f418ee77ca10be');
SoundLibrary.set('Fire', 'ca0d4f0e056f2da848a303897a885d58');
SoundLibrary.set('Footsteps', 'dfd630de7393e097c0e68cf6f1a50011');
SoundLibrary.set('Forest', 'db71d6e3a87308eb188cdb05f8012423');
SoundLibrary.set('Funk Music', '8b237f64fd564a3f62063cbc1f77552a');
SoundLibrary.set('Gallop', '22aa91cda02fbe2008a8247454dc0ab0');
SoundLibrary.set('Glass Breaking', '03c955d7270ce7bfeb4c6f463aaf136c');
SoundLibrary.set('Glug', '7f94bf5b94163f21963014fe2b46bd24');
SoundLibrary.set('Goal Cheer', '0484cc04f218bad5a269b6f69b2051b3');
SoundLibrary.set('Gong', '1488816800f646a32f01f8e5eef118c8');
SoundLibrary.set('Growl', '4933787ac79018b56a00766ee943c280');
SoundLibrary.set('Grunt', 'e58f021c6c319569aaa3e68700b58dd4');
SoundLibrary.set('Hammer Hit', 'c34afa0f5f3652378053d9d2155fb2ea');
SoundLibrary.set('Head Shake', 'dbc6e12177dbb3a18d9073f2aaa5abc7');
SoundLibrary.set('Helicopter', 'c39a700c90ae5add699a6c81522e9695');
SoundLibrary.set('High Whoosh', 'eceef64c11db082affe706e80bed778e');
SoundLibrary.set('Horror Music', 'dbe3927e41b0bc58af29f20ebae15e20');
SoundLibrary.set('Jump', '355cbb804d09ded4ef0d21949dbc2f47');
SoundLibrary.set('Jungle Frogs', '7c36541623b6fb460d662d9e10b35545');
SoundLibrary.set('Laser 1', 'f01268a73adfc471539fb8c35377b195');
SoundLibrary.set('Laser 2', '9d4b266f843f489c79e32fea3f79439c');
SoundLibrary.set('Laser 3', '5b9b3f56f9423364b8ae798db1772568');
SoundLibrary.set('Laughing Baby 1', '3a505a581685963eb888de8500497d17');
SoundLibrary.set('Laughing Baby 2', 'dfec6cf1cc520244ca30c04d6b6e9966');
SoundLibrary.set('Laughing Boy', '9065bad88711aea6b0f08e209dfeb133');
SoundLibrary.set('Laughing Crowd 1', '27921714de5b8bf252acb09590367d08');
SoundLibrary.set('Laughing Crowd 2', 'd8989b090ecc4aaa0f7cdf3c19d6acaf');
SoundLibrary.set('Laughing Girl', '834f30a36edf5d2558450e56c54d42ba');
SoundLibrary.set('Laughing Male', '27614c75fff0fa16981aff302191d08d');
SoundLibrary.set('Lose', '1cb5dc9de9a56ca5d48c700c39e7e719');
SoundLibrary.set('Low Boing', 'cc172ad3110f62fca2284ec83a8a259b');
SoundLibrary.set('Low Squeak', '628217becbc7099afcaef2d2d2d174ad');
SoundLibrary.set('Low Whoosh', '5b561dc88dcd6d7c9270140ae03c24d8');
SoundLibrary.set('Magic Spell', 'a0b0f7fe22a4c3571b972bf9307f8c3b');
SoundLibrary.set('Male Jump 1', '7c8c2d64ac837cedbad02f627dd7ad3e');
SoundLibrary.set('Male Jump 2', '3430c7763d9641edcbe6bb186ff8c752');
SoundLibrary.set('Medieval Music', 'afe7d2beaf3adf56d09592f54d399b0e');
SoundLibrary.set('Monster 1', 'ea69c068dc1157be9b6c24888628f7db');
SoundLibrary.set('Monster 2', '88dd092689de406f1cc4baed4f0885cd');
SoundLibrary.set('Moo', '2b6f8ac10bd103403f39b7de15eca9d6');
SoundLibrary.set('Ocean Wave', 'e8e344de5a89b5e13ad955cbbd884a90');
SoundLibrary.set('Oops', 'e4af6c18d3039288229cc63b77174272');
SoundLibrary.set('Orchestra Tuning', 'bc28b1880498729cdac869e17155bc09');
SoundLibrary.set('Owl', '75c6b4b6047ab8b3ee9dd8b85cda564f');
SoundLibrary.set('Party Blower', 'a26c8a2fc5a0c1f2e4f53cfb8d4aba37');
SoundLibrary.set('Pew', 'a36fc331e069e3d7819917eac593de1f');
SoundLibrary.set('Ping Pong Hit', '9356b8ca0fb6a4f2b1d5d18ad786ff4b');
SoundLibrary.set('Plane Flying By', '0895ddd035470985370843af5ee3d9e9');
SoundLibrary.set('Plane Motor Running', '940ab922b86d6dee62d050787390f7b0');
SoundLibrary.set('Plane Starting', '5590a4cd4d13d407c40cb6a956bd6175');
SoundLibrary.set('Pluck', 'c7869da4c399568309bed1d0084a4e7b');
SoundLibrary.set('Police Siren 1', '9deb91da6398c484df8a024ea6d72a67');
SoundLibrary.set('Police Siren 2', '2a4c24012344760afc7d3e9ebb1d82ca');
SoundLibrary.set('Police Siren 3', 'e28ef11acaaa2713d977ee4e0a9bcf94');
SoundLibrary.set('Punch', '3f7b170e3d3cdd74c5b3c1d377f5ba0f');
SoundLibrary.set('Rain', 'b8c0d5d2c78f697fa95e03bab13d2df2');
SoundLibrary.set('Ricochet', 'cb9a5f3b3a5028bfe38b9dd0c9216541');
SoundLibrary.set('Rimshot', '484bee22cf627b9c6d104a7afd3d58a2');
SoundLibrary.set('Ring Tone', '2072a537ef5429420b64da1989429e48');
SoundLibrary.set('Rip', '5c4b5ca298210bab6ce38f186aa563ed');
SoundLibrary.set('Robot 1', 'bcbb1fa18836b69169535cd0c4383023');
SoundLibrary.set('Robot 2', 'd3e01393f0bcba034c9e2215f15b06fd');
SoundLibrary.set('Robot 3', '18b0112056db2d3366f38b09e543cbb4');
SoundLibrary.set('Rocket Explosion Rumble', 'd672f69fe9222bbee291da333c79a28f');
SoundLibrary.set('Rooster', '37a8a13ac13e7f0c53f1aabd2d7115d8');
SoundLibrary.set('Scrambling Feet', 'b5903375b61fbb63029fccbf3047e49f');
SoundLibrary.set('Screech', '9cd1de9ed2cd89ee71aee16a8953848c');
SoundLibrary.set('Seagulls', '2a80ebb62817955e7a6837f46091e8e7');
SoundLibrary.set('Service Announcement', '532270c604a99ef7d17d305a7330b1f3');
SoundLibrary.set('Sewing Machine', '1ea0186f168aacce61a7d38abe5085fc');
SoundLibrary.set('Ship Bell', '43b4c467058ab959579ea916e7fa4af8');
SoundLibrary.set('Siren Whistle', '31905cbd007fb305548fe515225ae5c1');
SoundLibrary.set('Sitar Music', '4a5d966565396be2101b672fdccf9920');
SoundLibrary.set('Skid', 'aa14ee645ed2c21deb0e902c03e80036');
SoundLibrary.set('Slide Whistle 1', '653d69df42dce8c031f3124b9f3311c6');
SoundLibrary.set('Slide Whistle 2', '3c8f3b07aa823d6b64f4c1d2cb48f7d5');
SoundLibrary.set('Sneaker Squeak', '3ce116ced690acb2cc4e17ed54906161');
SoundLibrary.set('Snoring', '893e95a225ae5fa4e79fe2d12935d246');
SoundLibrary.set('Snort', '25fe9edd4f0e21041baa218a8a3bf82e');
SoundLibrary.set('Space Ambience', 'feaf78f095b3713fb5dde3a59cd51ec2');
SoundLibrary.set('Space Flyby', 'ddf2bca929c809fd9d3185aa136684ac');
SoundLibrary.set('Space Noise', 'e7bab9793551a51bbb62826a05587656');
SoundLibrary.set('Splash', '7d43af769279897d5a97c618cacc63af');
SoundLibrary.set('Sport Whistle 1', '3be8203710191437bc244c7d6bed01b7');
SoundLibrary.set('Sport Whistle 2', 'f4bf44596ad04da69e89fba2794dfccd');
SoundLibrary.set('Squeaky Toy', '6d054dbeb478cacfb95c2b84f64f49fd');
SoundLibrary.set('Squish Pop', '9a8384541c4b04cc506cefb86c2e8e12');
SoundLibrary.set('Stadium', '67f6666f06e6b43aaeb3dc819c0fde1b');
SoundLibrary.set('Suction Cup', 'dd13e3779dd2ebba9a1163c666e16c73');
SoundLibrary.set('Tada', '4c3e1095b20cea04f8e678cce11e71e2');
SoundLibrary.set('Telephone Ring', 'd5e96ed6ac71e448979d8b2496864798');
SoundLibrary.set('Telephone Ring 2', 'da9867e97f19021a9e3497eb40b2755c');
SoundLibrary.set('Teleport', '2dc421d5937740266658ec9168699ca0');
SoundLibrary.set('Teleport 2', '5e1a33715eda7d4e8f12b556599500ce');
SoundLibrary.set('Teleport 3', '813d11f4994d752923ce49d938f9ce18');
SoundLibrary.set('Tennis Hit', 'f8064f211020298c3d76c2c71a4c9e4f');
SoundLibrary.set('Thunder Storm', 'ccb7d6d8fb17b4a0891e963da47170ab');
SoundLibrary.set('Toliet Flush', '47bcb7a10e1ad81dd598d5fa7b5273fa');
SoundLibrary.set('Toy Honk', '5c939020440df172f75051f930d68acc');
SoundLibrary.set('Toy Zing', '41ba9587142a3222fcda985912a2b92f');
SoundLibrary.set('Traffic', '44e36b700aaa842101874032bc5fdea7');
SoundLibrary.set('Train Breaks', 'a4593f42bde265d3e7f0d8801608ad13');
SoundLibrary.set('Train Horn 1', '4d767525357b64138d216a1b29d6b510');
SoundLibrary.set('Train Horn 2', '830c5c9a8ae5f315a6c8cbde34e2d133');
SoundLibrary.set('Train Horn 3', 'ebccca6f6ae3fc42ba3269af09078388');
SoundLibrary.set('Train On Tracks', '9e89416e2169f942a80984fd869a0c28');
SoundLibrary.set('Train Signal 1', 'f29bce09f84cd6a9e9592b16c3881a67');
SoundLibrary.set('Train Signal 2', '49dedad79b25001f671714d1a9b85255');
SoundLibrary.set('Train Start', '3eaeb925f09665c1e877c08dcb6e32c7');
SoundLibrary.set('Train Whistle', '9201a56d251a72fb5756e87963785a37');
SoundLibrary.set('Triumph', '01bf8e868fdefcc360c29cd40c4d6908');
SoundLibrary.set('Tropical Birds', '623197ba6b9f6dea4fa0f305ab61ffc6');
SoundLibrary.set('Wand', 'a0c9e79e288c798a62a40453abcdb3a2');
SoundLibrary.set('Water Bubbles 1', 'b803b0429b5d99f2b310112b8db9a376');
SoundLibrary.set('Water Bubbles 2', '583b72f3d3b3426dfc1eb421479a3d96');
SoundLibrary.set('Water Stream', 'c44814bf1bad171596157fd2ac621879');
SoundLibrary.set('Water Drop', '839d2fdcfb125d3ca3b4c2b44cbf7668');
SoundLibrary.set('Whispers', '8da19ea22bbd2d49754203ea549ce289');
SoundLibrary.set('Whistle Thump', '555e87c3ed9559b7a86b3b249745c3ea');
SoundLibrary.set('Whiz 1', 'efe37257a2f98264316e18730b67223a');
SoundLibrary.set('Whiz 2', 'ec2b87b0a7ddaaf227a530e2d5e9da30');
SoundLibrary.set('Win', '9e4208dd5e29e39a1290b8f14d22c91c');
SoundLibrary.set('Window Breaks', 'e093a08bb289261bc2486d0acf0a3660');
SoundLibrary.set('Wobble', '07ff53e1912dd9645fcb0875326e7b3f');
SoundLibrary.set('Wolf', '3e33b7f87910dac47859538293910b93');
SoundLibrary.set('Wood Tap', '59657658bb5b3b0c4eff1d6c8fcfbf84');
SoundLibrary.set('Zen Music', '3d565e6bcb1548334f47a80a55c14ac7');
SoundLibrary.set('Zip', '648f2265233e359582fbb8745fcdddc7');

export const selectedAudio: LibraryItem[] = [];

export function clearSelectedAudio() {
    selectedAudio.length = 0;
}

export function selectAudio(name: string) {
    const sample = SoundLibrary.get(name);
    if (selectedAudio.find((x) => x.name == name)) {
        return;
    }
    if (sample) {
        selectedAudio.push({ name: name, id: sample });
    }
    selectedAudio.sort((a, b) => a.name.localeCompare(b.name));
}

export function removeAudio(name: string) {
    for (let i = selectedAudio.length - 1; i >= 0; i--) {
        if (selectedAudio[i].name === name) {
            selectedAudio.splice(i, 1);
        }
    }
}

export type AudioDialog = () => void;

export function registerAudioDialog(workspace: Blockly.WorkspaceSvg, dialogCreator: AudioDialog) {
    workspace.registerButtonCallback('ADD_SPIKE_AUDIO', dialogCreator);
}
