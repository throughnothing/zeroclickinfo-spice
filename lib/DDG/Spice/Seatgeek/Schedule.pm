package DDG::Spice::Seatgeek::Schedule;
# ABSTRACT: Search for music shows near the user location.

use DDG::Spice;

# TODO: Check if SeatGeek can accept the user's coordinates so that we can sort by distance.
spice to => 'http://api.seatgeek.com/2/events/?q=$1&sort=score.desc&taxonomies.name=concert&callback={{callback}}';

triggers any => "schedule";

handle remainder => sub {
    return $_ if $_;
    return;
};

1;
